---
layout: post
image: assets/images/system-design/escalabilidade-capa.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: MSc. Field Notes - Sharding Routing
---

> Notas e rascunhos da minha pesquisa acadêmica do mestrado

![Consistency Hashing](/assets/images/msc/consistent-hashing-routing.drawio.png)

![Bulkheads](/assets/images/msc/Scale-Bulkheads.jpg)

![Hash Ring](/assets/images/msc/hash-ring.jpg)

![Hash Calc](/assets/images/msc/Scale-Page-130.jpg)


# Implementação de um balanceador

```go
package main

import (
	"app/pkg/setup"
	"app/pkg/sharding"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
)

func main() {

	setup.Init()

	proxyHandler := func(w http.ResponseWriter, r *http.Request) {

		shardKey := sharding.GetShardingKey(r)
		shardURL := sharding.GetShardHost(shardKey)
		targetURL, err := url.Parse(shardURL + r.URL.Path)
		if err != nil {
			http.Error(w, "Invalid target URL", http.StatusBadRequest)
			return
		}

		proxyReq, err := http.NewRequest(r.Method, targetURL.String(), r.Body)
		if err != nil {
			http.Error(w, "Failed to create request", http.StatusInternalServerError)
			return
		}
		proxyReq.Header = r.Header

		client := &http.Client{}
		resp, err := client.Do(proxyReq)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadGateway)
			return
		}
		defer resp.Body.Close()

		for k, v := range resp.Header {
			w.Header()[k] = v
		}
		w.WriteHeader(resp.StatusCode)
		io.Copy(w, resp.Body)
	}

	// Inicia o servidor
	http.HandleFunc("/", proxyHandler)
	port := os.Getenv("ROUTER_PORT")
	log.Printf("HTTP Proxy running on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
```

```go
package hashring

import (
	"crypto/sha256"
	"encoding/binary"
	"sort"
	"strconv"
	"strings"
)

type Node struct {
	ID   string
	Hash uint64
}

// Representa o hash ring que contém vários nós.
type ConsistentHashRing struct {
	Nodes       []Node
	NumReplicas int
}

// Cria um novo anel de hash ring.
func NewConsistentHashRing(numReplicas int) *ConsistentHashRing {
	return &ConsistentHashRing{
		Nodes:       []Node{},
		NumReplicas: numReplicas,
	}
}

// Retorna o nó que contém o hash mais próximo do hash fornecido.
func (ring *ConsistentHashRing) AddNode(nodeID string) {
	for i := 0; i < ring.NumReplicas; i++ {
		replicaID := nodeID + strconv.Itoa(i)
		hash := hashKey(replicaID)
		ring.Nodes = append(ring.Nodes, Node{ID: nodeID, Hash: hash})
	}
	sort.Slice(ring.Nodes, func(i, j int) bool {
		return ring.Nodes[i].Hash < ring.Nodes[j].Hash
	})
}

// Calcula o hash do tenant e a converte para uint64.
func hashKey(s string) uint64 {
	s = strings.ToLower(s)
	hash := sha256.New()
	hash.Write([]byte(s))
	hashBytes := hash.Sum(nil)
	return binary.BigEndian.Uint64(hashBytes[:8])
}

// Retorna o node onde o Tenant deverá estar alocado
func (ring *ConsistentHashRing) GetNode(key string) string {
	hash := hashKey(key)
	idx := sort.Search(len(ring.Nodes), func(i int) bool {
		return ring.Nodes[i].Hash >= hash
	})

	// Se o índice estiver fora dos limites, retorna ao primeiro nó
	if idx == len(ring.Nodes) {
		idx = 0
	}

	return ring.Nodes[idx].ID
}

// Exemplos do artigo: https://fidelissauro.dev/sharding/
```

```go
package sharding

import (
	"app/pkg/hashring"
	"fmt"
	"net/http"
	"os"
)

var hashRing *hashring.ConsistentHashRing

func InitHashRing(size int) {
	hashRing = hashring.NewConsistentHashRing(size)
}

func AddShard(shardHost string) {
	fmt.Println("Adding shard to hash ring: ", shardHost)
	hashRing.AddNode(shardHost)
}

func GetShardingKey(r *http.Request) string {
	shardingKey := os.Getenv("SHARDING_KEY")
	key := r.Header.Get(shardingKey)
	return key
}

func GetShardHost(key string) string {
	node := hashRing.GetNode(key)
	fmt.Printf("Mapping sharding key %s to host: %s\n", key, node)
	return node
}

```
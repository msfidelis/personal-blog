---
layout: post
image: assets/images/system-design/sincrono.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Padrões de Comunicação Sincronos
---

Este texto é uma continuação direta do capitulo onde falamos sobre [Protocolos e Comunicação de Redes](). A ideia é seguir com os conceitos direcionados anteriormente para aplicá-los em diferentes tipos de padrões de comunicação direcionados na contrução de software em arquiteturas modernas e distribuídas. Nesse capítulo iremos falar sobre alguns padrões que podemos utilizar para **construção de chamadas sincronas entre serviços**, aproveitando os conhecimentos ofertados quando abordamos sobre o Protocolo HTTP, TCP/IP e UDP para detalhar conceitualmente com a visão de System Design outras tecnologias e padrões como o **Padrão REST, gRPC, Websockets e GraphQL**. 

# Definindo Comunicações Sincronas

Uma comunicação síncrona, de forma bem direta e simples, é um padrão de comunicação utilizados em sistemas distribuídos, ou não, onde o **cliente espera por uma resposta do servidor antes de prosseguir a execução de outras tarefas**. Por exemplo, em um ambiente de microserviços de um domínio de logística, um sistema que estima o preço de um frete precisa recuperar em um outro sistema responsável pelo cadastral de seus clientes as informações de endereço antes de prosseguir com o calculo de fato. 

Este modelo de comunicação é caracterizado por sua natureza **"bloqueante"**, significando que o **processo que inicia a chamada fica "bloqueado" até que a operação e a comunicação com o servidor seja concluída**, significando uma "espera ativa" entre os dois componentes. Em outras palavras, a comunicação síncrona envolve uma interação **direta e imediata entre as partes**, facilitando um "diálogo" que precise ser concluído fim-a-fim em tempo de execução de uma tarefa.

Esse padrão é muito bem recebido onde a **consistência dos dados é de extrema importância**, pois as operações podem ser facilmente feitas em uma **sequência específica**, além de ser muito mais simples e intuitiva em quesitos de entendimento e implementação. 

Em quesito de desvantagens, a implementação de uma comunicação sincrona pode **limitar a escalabilidade do sistema**, uma vez que o bloqueio durante a espera por respostas pode **reduzir a capacidade de processamento paralelo**, além de afetar performance em cadeia, onde o mau funcionamento constante ou temporário de uma dependência específica entre uma série de chamadas pode acabar aumentando o tempo de resposta e processamento. O ponto mais crítico é que a indisponibilidade de um serviço que é dependente de um processo bloqueante pode i**nvariávelmente degradar a disponibilidade geral de uma cadeia de processos**. 

Nesse sentido, por mais simples que sejam a construção e manutenção de chaamdas sincronas, é necessário o cuidado com questões de retentativas, timeouts e outras estratégias de resiliência cosntruída de forma pragmática entre cliente-servidor. 

<br>

# REST - Representational State Transfer 

O **REST**, ou **Representational State Transfer**, é um estilo **arquitetônico para sistemas distribuídos** que presa pela simplicidade da comunicação entre componentes na internet ou em redes internas de microserviços. Definido por **Roy Fielding** em sua tese de doutorado em 2000, REST não é um protocolo ou padrão, mas um conjunto de princípios arquitetônicos usados para projetar sistemas distribuídos escaláveis, confiáveis e de fácil manutenção. **Os serviços que seguem os princípios REST são conhecidos como RESTful em API's.**

O REST é construído usando referências e recursos do **protocolo HTTP**, definindo papeis e responsabilidades de cliente-servidor e busca **estabelecer uma interface de um cliente com os dados e ações de um sistema** de forma intuitiva. 

Ele utiliza métodos HTTP para definir ações, como **GET, POST, PUT, DELETE e PATCH**, para realizar operações CRUD **(Criar, Ler, Atualizar, Deletar)** em recursos identificados por URI's. Esses recursos são representações de entidades ou objetos do domínio da aplicação.

### Componentes de uma requisição REST 

Uma requisição REST é composta por vários componentes que trabalham juntos para transmitir a intenção da solicitação do cliente para o servidor. Cada componente tem um papel específico no fornecimento de informações necessárias para que o servidor processe a requisição de maneira eficaz.

### URI's e URL's 

Dentro do contexto REST, os conceitos de URI, URL e URN têm papéis específicos quando se trata de identificar e interagir com recursos expostos por API's. Em REST, um "recurso" é uma abstração de qualquer informação ou dado que pode ser nomeado, como documentos, imagens, serviços, coleções de outros recursos, e assim por diante. 

#### URI - Uniform Resource Identifier 

Um URI é uma string de caracteres que identifica um recurso específico. Um recurso pode ser qualquer coisa que seja identificável na web, como um documento, uma imagem, um serviço de transmissão de vídeo, ou uma coleção de outros recursos. URIs servem como um mecanismo de identificação universal na web, permitindo que recursos sejam localizados e referenciados de forma única. Dentro do REST, cada recurso é identificado de forma única por um URI. Isso permite que clientes e servidores se refiram a um recurso específico sem ambiguidade. Por exemplo, um URI pode ser usado para identificar um determinado livro em um sistema de biblioteca digital, um usuário em uma rede social, ou uma transação em um sistema financeiro e etc. 

#### URL - Uniform Resource Locator

No REST, as URLs são o meio mais comum de expressar URIs. Elas especificam **não apenas a identidade de um recurso, mas também como acessá-lo**. Por exemplo, a URL https://api.fidelissauro.dev/livro/1234 não apenas identifica um recurso de livro específico (1234) no domínio api.fidelissauro.dev, mas também indica como o recurso pode ser acessado usando o protocolo HTTPS. Uma vez que conseguimos identificar esses recursos de forma universal e padronizada, as URL's que representam esses recursos podem ser usadas em conjunto com os métodos HTTP (GET, POST, PUT, DELETE, etc.) para realizar operações sobre os dados que fazemos gestão via API.

### Recursos e Paths 


### de Métodos HTTP para Representar Ações

Os métodos HTTP, também conhecidos como "verbos", definem ações que podem ser realizadas sobre os recursos. Eles permitem uma interação semântica com os recursos, onde cada método tem um propósito específico:

| Método  | Descrição                                                                                                                                 | Idempotência |
|---------|--------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| GET     | Utilizado para **recuperar a representação de um recurso sem modificá-lo**. É seguro e **idempotente**, o que significa que várias **requisições idênticas devem ter o mesmo efeito que uma única requisição.** | Sim          |
| POST    | Empregado para **criar um novo recurso**. **Não é idempotente**, pois realizar várias requisições POST pode criar múltiplos recursos.                                                              | Não          |
| PUT     | Utilizado para **atualizar um recurso existente ou criar um novo se ele não existir**, no URI especificado. **É idempotente**, então **múltiplas requisições idênticas terão o mesmo efeito sobre a entidade**.   | Sim          |
| DELETE  | Empregado para **remover um recurso**. É **idempotente, pois deletar um recurso várias vezes tem o mesmo efeito que deletá-lo uma única vez**.                                                      | Sim          |
| PATCH   | Utilizado para **aplicar atualizações parciais a um recurso**. Ao contrário do PUT, que substitui o recurso inteiro, o **PATCH modifica apenas as partes especificadas**. É idempotente, pois a execução sob o mesmo recurso tende a gerar sempre o mesmo efeito e gerar o mesmo resultado. | Sim          |

<br>

### Métodos HTTP nas URI's e Recursos

As URIs são utilizadas para identificar os recursos de forma única. Em uma API RESTful, as URIs são projetadas para serem intuitivas e descritivas, facilitando o entendimento e a navegação pelos recursos disponíveis. A estrutura de uma URI em REST reflete a organização dos recursos e suas relações.

As URIs quando olhadas no modelo REST, devem se referir a recursos e entidades,  e não às ações que serão realizadas diretamentesobre eles. Por exemplo, o path `/users` para acessar recursos do usuário combinado com o método `GET`, e não um basepath imperativo como `/getUsers`.

A URI de determinadas entidades devem refletir a estrutura hierárquica dos recursos. Por exemplo, `/users/123/posts` pode representar os posts do usuário com ID 123.

Devem se utilizar querystrings como parametros de consulta para filtrar recursos ou modificar a saída de uma chamada REST. Por exemplo, `/users?active=true` para filtrar apenas usuários ativos ou `/users/123/posts?tag=system-design` para filtrar os posts do usuário com a tag `system-design`. 

Considerando uma API para um portal de notícias ou blog, aqui estão exemplos de como os métodos HTTP e as URIs podem ser utilizados para interagir com os recursos:

| Ação                          | Método | Endpoint     |
|-------------------------------|--------|--------------|
| Listar todos os posts         | GET    | `/posts`     |
| Obter um post específico      | GET    | `/posts/1`   |
| Criar um novo post            | POST   | `/posts`     |
| Atualizar um post existente   | PUT    | `/posts/1`   |
| Deletar um post               | DELETE | `/posts/1`   |
| Atualizar parte de um post    | PATCH  | `/posts/1`    |


<br>

#### Status Codes de Resposta e Padrões do REST

Os códigos de status de resposta são recursos nativos do protocolo HTTP que são utilizados para implementações RESTful, pois são usados como convenção para indicar informações de estado das respostas de uma  solicitação. Ele abre o leque das classes dando funcionalidades e representatividade a elas perante uma solicitação.  

Os status codes mais utilizados em implementações RESTFul são os seguintes: 

| Código                    | Descrição                                                                                 |
|---------------------------|-------------------------------------------------------------------------------------------|
| 200 OK                    | Solicitação bem-sucedida para GET, PUT ou POST sem criação de recurso.                    |
| 201 Created               | Nova criação de recurso resultante de uma solicitação POST.                               |
| 202 Accepted              | Solicitação aceita para processamento; conclusão pendente.                                |
| 204 No Content            | Solicitação bem-sucedida sem conteúdo para retornar. Comum após DELETE.                   |
| 400 Bad Request           | Erro de cliente devido a sintaxe ou formato inválido.                                     |
| 401 Unauthorized          | Falha ou necessidade de autenticação.                                                     |
| 403 Forbidden             | Servidor recusa a solicitação, apesar de compreendê-la.                                   |
| 404 Not Found             | Recurso solicitado não encontrado.                                                        |
| 405 Method Not Allowed    | Método conhecido pelo servidor, mas desativado.                                           |
| 500 Internal Server Error | Falha genérica do servidor.                                                               |
| 503 Service Unavailable   | Servidor indisponível, geralmente por manutenção ou sobrecarga.                           |
| 504 Gateway Timeout       | Tempo limite atingido por um servidor gateway ou proxy sem resposta do servidor upstream. |

<br>

### Headers 

### Params e Query Strings 

### Body e Formatos

### Principios do REST 

Os principios arquiteturais do REST estabelecem uma série de regras e bases de design para que times de engenharia projetem API's de comunicação distribuida da melhor forma possível, prezando tanto pela experiência de consumo do cliente quanto do ciclo de vida e evolução saudável do projeto a médio e longo prazo. Nesta sessão vamos explorar alguns dos principios que podem ser esperados de implementações RESTFul. 

#### Interface Uniforme 

A interface uniforme é o princípio central do REST e diz respeito à consistência na forma como as interfaces são expostas aos clientes. Esse principio preza para que cada recurso deve ser identificável de forma única através de URIs e suas respostas sejam representadas por dados padronizados, como JSON ou XML, e enviados ao cliente respeitando esses formatos. Também é importante ressaltar que as requisições e respostas devem conter toda a informação necessária para serem compreendidas, incluindo metadados e hiperlinks de uma forma quase auto-descritiva. De forma resumida, esse princípio garante uma padronização formal na forma como os clientes interagem com o servidor e vice versa. 

Garantindo uma interface uniforme, arbitrariamente garantimos a interoperabilidade, ou seja, compatibilidade entre diferentes sistemas e tecnologias, pois independente do ferramental escolhido para construção do cliente e do servidor, a comunicação possa ser respeitada e padronizada entre ambos, sem o conhecimento das necessidades de implementação. Quando trabalhamos em interfaces, é importante também projetá-las para promover cada vez mais um desacoplamento entre sistemas. 

#### Comunicação Stateless 

No REST, cada requisição do cliente para o servidor **deve conter todas as informações necessárias para entender e completar a requisição**. O servidor **não armazena nenhum estado da sessão do cliente**. A comunicação stateless (*sem estado*) é um dos princípios fundamentais que define como os clientes e servidores interagem entre si. Esse princípio assegura que cada requisição de um cliente para um servidor deve conter todas as informações necessárias para o servidor compreender e responder à requisição. Em outras palavras, o **servidor não armazena nenhum estado sobre o cliente entre as requisições. Cada uma delas é tratada como se fosse a primeira, sem qualquer conhecimento prévio ou memória das interações anteriores.**

A natureza stateless também aumenta os níveis de confiabilidade do sistema. Se um **servidor falhar após processar uma requisição, o cliente pode simplesmente tentar novamente, possivelmente usando outro node de pool de servidores de uma arquitetura distribuída**. Como nenhuma informação de estado é mantida entre as requisições, não há perda de continuidade.. Esse é um dos principios que garante a [escalabilidade horizontal](/performance-capacidade-escalabilidade/) de aplicações REST em ambientes sensíveis em demanda de forma transparente. 

Os desafios de uma arquitetura stateless giram principalmente em torno dos tópicos de autenticação. Usar tokens, como JWT (JSON Web Tokens) pode se tornar uma estratégia recomendada, pois os mesmos podem conter informações comuns do cliente que efetua a solicitação junto com meios de validar a integridade e validade dos mesmos sem a nacessidade de manter histórico entre as requisições. 

#### Camadas 

A **arquitetura em camadas permite que intermediários (como proxies e gateways) facilitem ou melhorem a comunicação entre o cliente e o servidor** de forma transparente, promovendo a **segurança, o balanceamento de carga e a capacidade de cache**. Combinando o conceito e viabilidade de camadas com o padrão stateless, o padrão se torna muito poderoso e escalável. 

O princípio de camadas, ou *"Layered System"*, é uma das **restrições arquiteturais mais importantes do REST, pois influencia o design de sistemas distribuídos sensíveis a escala constante**, especialmente APIs RESTful. Este princípio estabelece que a arquitetura de uma aplicação deve ser **organizada em camadas hierárquicas, cada uma com uma função específica**. A comunicação ocorre sequencialmente de uma camada para outra, mas cada camada **não precisa conhecer os detalhes das camadas internas ou externas a ela**, apenas interagir com as camadas imediatamente adjacentes.

Entre essas camadas podem existir camadas de API gateways, camadas de autenticação e autorização, camadas de cacheamento das requisições e respostas, [camadas de balanceadores de carga, camadas de proxy reversos](), camada de roteamento, lógicas de negócios, acesso a dados e etc. 

#### Cache 

As respostas do servidor **devem ser explícitas quanto à sua cacheabilidade para evitar a reutilização de dados obsoletos ou inapropriados, melhorando a eficiência e a escalabilidade**. O [cache é uma técnica amplamente utilizada no desenvolvimento de software](), especialmente em aplicações web e APIs, incluindo aquelas que seguem o estilo arquitetônico REST (Representational State Transfer). O objetivo **do cache é melhorar a eficiência e a performance da aplicação, armazenando cópias de recursos ou resultados de operações que são caros para gerar ou buscar**, permitindo que esses dados sejam reutilizados em requisições futuras.

No contexto de APIs REST, o cache pode ser implementado tanto no lado do cliente quanto no servidor, além de pontos intermediários na rede, como proxies e gateways de API. Isso ajuda a reduzir a latência, diminuir a carga no servidor e melhorar a experiência geral do usuário ao acessar a aplicação

A dinamica do cache em transações HTTP e API's RESTful depende de um gerenciamento cuidadoso para garantir que os dados armazenados sejam precisos, úteis e atualizados. Cabeçalhos HTTP, como `Cache-Control`, `Last-Modified`, e `ETag`, são utilizados para controlar o comportamento do cache, incluindo a validade, revalidação e a expiração do cache desses recursos.



<br>

# RPC - Remote Procedure Call 

O **RPC** (*Remote Procedure Call*) é um protocolo utilizado para executar **chamadas de procedimento ou métodos em um sistema computacional diferente daquele em que o código está sendo executado**. Este protocolo permite que um programa em um dispositivo (cliente) envie uma solicitação de execução de procedimento para um software em outro dispositivo (servidor), que executa o procedimento e retorna o resultado. O RPC abstrai a complexidade da comunicação em rede, permitindo aos desenvolvedores se concentrarem na lógica de negócios, em vez dos detalhes de como os dados são transmitidos e recebidos. 

### Exemplo de um Servidor RPC

Ao contrário do gRPC que veremos a seguir, chamadas RPC convencionais não precisam necessariamente de um contrato forte, o que pode ser bom no caso de flexibilidade e velocidade de implementação quanto ruim para manter um padrão e consistência dos dados. Nesse exemplo vamos implementar uma chamada para um sistema que calcula a quantidade de ingestão diária de proteína recomendada baseada no peso informado. 

A implementação se baseia apenas em criar um método e registrá-lo em um rpc server alocado em uma porta do host, no caso do exemplo, a porta `1234`. 

```go
package main

import (
	"fmt"
	"net"
	"net/rpc"
)

type Args struct {
	Peso float64
}

// Calculo de Recomendação de Consumo de Proteínas
// Baseado no peso informado
type Proteinas float64

func (p *Proteinas) Recomendacao(args Args, reply *float64) error {
	// Calcula o o consumo de proteina recomendado e devolve para o objeto de respotsa
	*reply = args.Peso * 2
	return nil
}

func main() {

	// Registrando o serviço RPC na porta 1234
	proteina := new(Proteinas)
	rpc.Register(proteina)

	ln, err := net.Listen("tcp", ":1234")
	if err != nil {
		fmt.Println("Falha ao ouvir na porta:", err)
		return
	}
	for {
		conn, err := ln.Accept()
		if err != nil {
			fmt.Println("Falha ao aceitar a conexão.:", err)
			continue
		}
		// Servindo a rotina RPC
		go rpc.ServeConn(conn)
	}

}
```

### Exemplo de um Client RPC

A implementação de um cliente tende a ser bem mais simples. Basta criar uma conexão com a porta onde o servidor e o método RPC foi alocado, informando uma lista de argumentos do formato esperado do lado do servidor. Como ele não exige um contrato forte, os prós e contras tendem a ser os mesmos informados anteriormente, velocidade e flexibilidade em troca de consistência. 

```go
package main

import (
	"fmt"
	"net/rpc"
)

type Args struct {
	Peso float64
}

func main() {
	client, err := rpc.Dial("tcp", "0.0.0.0:1234")
	if err != nil {
		fmt.Println("Falha ao conectar:", err)
		return
	}
	var reply float64
	args := Args{Peso: 85.00}

	fmt.Println("Iniciando a chamada RPC para o serviço Proteinas.Recomendacao")
	err = client.Call("Proteinas.Recomendacao", args, &reply)
	if err != nil {
		fmt.Println("Erro na chamada:", err)
		return
	}

	fmt.Printf("O consumo de proteínas adequado para o peso de %v kg é de %vg por dia\n", args.Peso, reply)
}
```

```
Iniciando a chamada RPC para o serviço Proteinas.Recomendacao
O consumo de proteínas adequado para o peso de 85 kg é de 170g por dia
```

# gRPC - Google Remote Procedure Call

O gRPC é um framework de chamada de procedimento remoto (RPC) de código aberto desenvolvido pelo Google. Ele permite que os desenvolvedores conectem serviços de maneira performática e escalável, possibilitando a comunicação entre serviços construídos de maneira distribuída. Seu design baseia-se no uso de **HTTP/2 como protocolo de transporte**, **Protocol Buffers (ProtoBuf)** como linguagem de interface de descrição de serviço (IDL), e além do conceito das chamadas RPC que já abordamos, ele oferece recursos como autenticação, balanceamento de carga e validações.  Essa arquitetura é ideal para construir arquiteturas de microserviços, onde serviços leves e performáticos são críticos para o desempenho e a escalabilidade. 

![gRPC](/assets/images/system-design/grpc.png)

Com o HTTP/2, **é possível fazer múltiplas chamadas RPC em paralelo sobre uma única conexão TCP**, o que é uma grande melhoria em termos de eficiência de rede e latência.

O gRPC suporta **streaming bidirecional**, permitindo que **tanto o cliente quanto o servidor enviem uma sequência de mensagens para o outro usando uma única conexão**. Isso é particularmente útil para casos de uso como chat em tempo real, monitoramento em tempo real e outros cenários que exigem comunicação contínua e persistente. 

Implementar e **gerenciar um sistema baseado em gRPC pode ser mais complexo do que usar alternativas mais simples como REST**, especialmente em projetos menores ou com requisitos menos rigorosos de desempenho. A característica de se utilizar contratos por ProtoBuf para manter um contrato consistencia, encontra-se a necessidade de distribuir e versionar esse contrato entre o cliente e o servidor. Uma vez que esse contrato precise ser mudado para adicionar, modificar ou remover alguma variável do mesmo, pode existir a problemática de garantir a atualização de todos os clientes desse serviço. 

## ProtoBufs 

O Protocol Buffers, ou ProtoBuf, é a linguagem de descrição de interface preferida pelo gRPC, é usada para definir os serviços e a **estrutura de dados que serão compartilhados entre cliente e servidor por meio de um contrato forte**. ProtoBuf é um sistema de serialização binária que não só é mais eficiente em termos de espaço do que formatos como JSON, mas também fornece uma maneira clara de especificar a interface do serviço de maneira agnóstica a linguagens e frameworks

### Exemplo de Protobuf

Nesse contrato de exemplo escrevemos a assinatura / contrato de comunicação gRPC que deverá acontecer via client-server utilizando a sintaxe `proto3`. Descrevemos o service chamado `IMCService` que implementa um método chamado `Calcular`, que recebe um objeto de mensagem no padrão descrito no `IMCRequest` e retorna uma mensagem no padrão descrito no `IMCResponse`. A linguagem superficialmente é descritiva e bem simples. 

```proto
syntax = "proto3";

package imc;

option go_package = "service/imc";

// O serviço IMCService oferece a operação de calcular o quadrado de um número.
service IMCService {
  // IMC calcula o quadrado de um número.
  rpc Calcular (IMCRequest) returns (IMCResponse) {}
}

// IMCRequest contém o a altura e peso para o qual queremos calcular o IMC.
message IMCRequest {
  double weight = 1;
  double height = 2;
}

// IMCResponse contém o resultado do cálculo do IMC informado.
message IMCResponse {
  double result = 1;
}
```

Após descrever o contrato, precisamos gerar os pacotes `.go` que implementam esse contrato. Para gerar esses pacotes normalmente usamos o pacote `protoc`. Quando estamos gerando esses arquivos em golang, dois pacotes devem ser gerados no padrão `imc_grpc.pb.go` e `imc.pb.go`. Esses pacotes precisam ser implementados tanto no client quanto no server. 

```bash
protoc --go_out=. --go-grpc_out=. imc.proto
```


### Exemplo de Server gRPC

Tendo os contratos criados pelo protobuf importados, podemos iniciar a implementação de um gRPC Server de forma simplificada. Precisamos respeitar os contratos definidos, implementando um método chamado `Calcular` que recebe e responde os objetos com a assinatura definida. Após implementar as funções necessárias com as lógicas do serviço, só precisamos alocar uma porta, no caso, `50051` e registrar esse serviço no servidor gRPC. 

```go
package main

import (
	"context"
	"fmt"
	imc "main/service/imc"
	"math"
	"net"

	"google.golang.org/grpc"
)

// Cria um servico baseado no protobuf informado
type service struct {
	imc.IMCServiceServer
}

// Método utilizado para calcular o IMC com a altura e peso informados
func (s *service) Calcular(ctx context.Context, in *imc.IMCRequest) (*imc.IMCResponse, error) {
	fmt.Println("Iniciando Calculo")
	result := (in.Weight / (in.Height * in.Height)) * 1
	result = math.Round(result*100) / 100
	return &imc.IMCResponse{Result: float64(result)}, nil
}

func main() {
	// Alocando a porta 50051 para o servidor
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		fmt.Println("Falha ao servir na porta 50051:", err)
		return
	}

	// Instancia um servidor gRPC
	s := grpc.NewServer()

	// Registra o serviço de calculo no servidor gRPC
	fmt.Println("Registrando o serviço de Calculo de IMC no server gRPC")
	imc.RegisterIMCServiceServer(s, &service{})

	// Instancia o servidor na porta alocada
	if err := s.Serve(lis); err != nil {
		fmt.Println("Falha criar o servidor gRPC:", err)
		return
	}
}
```

### Exemplo de Client gRPC

Para implementar o client de um server gRPC, precisamos utilizar o mesmo coontrato, criar uma conexão persistente com o endereço/porta do servidor e chamar a o método definido na assinatura `Calcular`, informando os dados no formato acordado, e recebendo a resposta em seguida. 

```go
package main

import (
	"context"
	"log"
	"time"

	imc "main/service/imc"

	"google.golang.org/grpc"
)

func main() {
	conn, err := grpc.Dial("0.0.0.0:50051", grpc.WithInsecure(), grpc.WithBlock())
	if err != nil {
		log.Fatalf("Falha ao conectar ao servidor gRPC: %v", err)
	}
	defer conn.Close()
	client := imc.NewIMCServiceClient(conn)

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	// Executa uma chamada gRPC para o servidor calcular o IMC
	peso := 90.5
	altura := 1.77
	r, err := client.Calcular(ctx, &imc.IMCRequest{
		Weight: peso,
		Height: altura,
	})
	if err != nil {
		log.Fatalf("Falha ao executar a chamada: %v", err)
	}
	fmt.Sprintf("O IMC de uma pessoa com %v de peso e %v de altura é de: %v\n", peso, altura, r.GetResult())
}
```

```
Registrando o serviço de Calculo de IMC no server gRPC
Iniciando Calculo...
```

```
❯ go run main.go
2024/03/17 20:18:55 O IMC de uma pessoa com 90.5 de peso e 1.77 de altura é de: 28.89
```

<br>

# Websockets

Uma comunicação baseada em Websockets são uma alternativa para solucionar **problemas de comunicação em tempo real entre clientes e servidores em tecnologias de desenvolvimento web**. Diferentemente do modelo tradicional de requisição e resposta HTTP, que é unidirecional e cria uma nova conexão TCP para cada requisição/resposta, o protocolo WebSocket estabelece uma **conexão full-duplex sobre um único socket TCP**. Isso permite uma **comunicação bidirecional contínua entre o cliente e o servidor**, ideal para aplicações web que necessitem de interações em tempo real de atualizações frequentes e instantâneas, como chats online, dashboards dinamicos, graficos de dados financeiros, sistemas de notificações e jogos online. 

![Web Socket](/assets/images/system-design/websocket.png)

A conexão WebSocket inicia-se como uma requisição HTTP padrão, mas solicita um "upgrade" para WebSockets através do cabeçalho `Upgrade`. Se o **servidor suporta WebSockets, ele responde com uma confirmação do "upgrade" e a conexão HTTP é então elevada a uma conexão WebSocket**. Uma vez estabelecida, a **conexão WebSocket permanece aberta, permitindo que tanto o cliente quanto o servidor enviem dados a qualquer momento até que a conexão seja fechada por uma das partes**. Ao manter uma conexão aberta, WebSockets eliminam a necessidade de estabelecer novas conexões HTTP para cada interação, reduzindo significativamente a latência.

Qualquer uma das partes (cliente ou servidor) pode iniciar o fechamento da conexão WebSocket. A parte que deseja fechar a conexão envia uma solicitação de fechamento, e após a outra parte responder, a conexão é fechada.

Embora a maioria dos navegadores modernos suporte WebSockets, pode haver problemas de compatibilidade com navegadores mais antigos ou em ambientes de rede restritivos que não permitem conexões WebSocket. Além de que gerenciar uma conexão WebSocket persistente e garantir a retransmissão de mensagens perdidas pode ser mais complexo do que usar requisições HTTP simples.


### Implementacão de um server de WebSockets



<br>

# GraphQL

O GraphQL é uma **linguagem de consulta para APIs e um runtime para execução dessas consultas pelo lado do servidor**. Desenvolvido pelo Facebook em 2012 e lançado publicamente em 2015, GraphQL **oferece uma abordagem flexível para o desenvolvimento de APIs em comparação com a abordagem tradicional REST**. Ele permite que os clientes **definam a estrutura dos dados requeridos, e exatamente esses dados**, nada mais, nada menos, são retornados pelo servidor. Isso não só torna as consultas mais eficientes, mas também resolve o problema de sobrecarga e subutilização de dados frequentemente encontrado em APIs REST.

O grande motivador da tecnologia é reduzir o **over-fetching e under-fetching, pois permite que os clientes solicitem exatamente os dados de que precisam sem a necessidade de lidar com gigantescos payloads**. 


<br>

## Convergência de Arquiteturas gRPC & REST & GraphQL 

Expor diretamente endpoints gRPC para clientes em escala pode ser uma tarefa trabalhosa, principalmente em arquiteturas corporativas de grande granularidade. Nesse sentido, se olharmos nossa arquitetura com uma ótica de [domínios de software](), podemos fazer uso de uma convergência de mais de um protocolo de comunicação dentro de uma malha de serviços. 

Uma vez que o problema de distribuir e versionar arquivos de protobufs são uma tarefa complicada, e os contrato REST são mais simples de ser interpretados, podemos pensar em acordos onde o domínio de software pode ser exposto dentro de um contrato REST e a comunicação interna entre os microserviços desse domínio possam falar um protocolo mais leve em comunicação como o gRPC. Essa tarefa pode ser extendida para instâncias de GraphQL da mesma forma. 

![gRPC Misc](/assets/images/system-design/grpc-misc.png)

<br>

### Referências


[HTTP Status](https://www.httpstatus.com.br/)

[HTTP Cats](https://http.cat/)

[Qual é a diferença entre gRPC e REST?](https://aws.amazon.com/pt/compare/the-difference-between-grpc-and-rest/)

[ntegration challenges in microservices architecture with gRPC & REST ](https://www.cncf.io/blog/2022/02/11/integration-challenges-in-microservices-architecture-with-grpc-rest/)

[REST vs. GraphQL vs. gRPC vs. WebSocket](https://www.resolutesoftware.com/blog/rest-vs-graphql-vs-grpc-vs-websocket/)

[gRPC vs REST](https://www.gslab.com/blogs/grpc-vs-rest-a-complete-guide/)

[gRPC](https://grpc.io/)

[gRPC Golang](https://github.com/grpc/grpc-go)

[Protobuf](https://protobuf.dev/)

[Protocol Buffers - Google's data interchange format](https://github.com/protocolbuffers/protobuf)

[RPC Implementation in Go ](https://dev.to/karankumarshreds/go-rpc-implementation-4731)

[Echo Microframework](https://echo.labstack.com/docs/)

[Gorilla - Websockets](https://github.com/gorilla/websocket/blob/main/examples/chat/client.go)

[Nutrition Overengineering](https://github.com/msfidelis/nutrition-overengineering)

[System Design Examples - gRPC](https://github.com/msfidelis/system-design-examples/tree/main/sync_protocols/grpc)

[URI, URN e URL](https://igluonline.com/qual-diferenca-entre-url-uri-e-urn/)

[REST Architectural Constraints](https://restfulapi.net/rest-architectural-constraints/)
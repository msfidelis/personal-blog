---
layout: post
image: assets/images/keda-tps/thumb.jpg
author: matheus
featured: false
published: false
categories: [ keda, kubernetes, containers, cloud-native, capacity, dicas ]
title: Keda - Escalando sua aplicação por requests HTTP usando métricas do Prometheus
---

O [Keda Autoscaler](https://keda.sh/) é uma das minhas tecnologias favoritas da Landscape da [CNCF](https://www.cncf.io/projects/). Considero divertido, sem meias palavras, as possibilidades que ele te proporciona pra trabalhar com autoscale. 

Em serviços de alta demanda com como e-commerces, instituições financeiras e serviços de streaming o fluxo de requisições é ininterrupto, porém a quantidade dessas requisições pode variar dramaticamente em determinados períodos do dia, do mês ou do ano, exigindo que os sistemas subjacentes que atendem essas solicitações acompanhem essa demanda em tempo real, se adaptando rapidamente para manter a perfomance e disponibilidade. 

Nesse artigo rápido vou apresentar uma prova de conceito interessante para propocionar o escalonamento da sua aplicação por meio de demanda, ou seja, requisições de consumo dentro de um período de tempo. 

<br>

# Fundamentos e Premissas

O monitoramento de **TPS/RPS** em ambientes de alta demanda não é apenas uma medida de desempenho, é um indicador muito importante para direcionamentos e tomadas de decisões arquiteturais tanto na concepção de novos serviços quanto na evolução de crescimento dos mesmos. Essa informacão te permite a melhor escolha de estratégias de capacity, desenhos arquiteturais, identificação de gargalos e otimização de recursos.

Este tipo de estratégia que será utilizada é uma alternativa para workloads muito sensíveis a tráfego, e que contam com certos picos de consumo aleatórios durante o dia.

<br>

### Premissas dessa prova de conceito 
* Eu sei que cada réplica da minha aplicação aguenta, sem se degradar, 10 tps (transações por segundo).
* Essa informação veio por meio de supostos testes de carga que foram realizados de forma prévia.
* Com isso, preciso que minha aplicação tenha 10 replicas no ar a partir de que minhas solicitações cheguem a 100/tps. 
* Da mesma forma como preciso que existam 4 replicas se o fluxo cair para 40/tps. 
* Da mesma forma como preciso que existam 20 replicas se o fluxo subir para 200/tps. 
* E assim vai... 

<br>

# O "Problema" de Escalar por Uso e Saturação de CPU e Memória

Na realidade, não existe nenhum problema em escalar dessa forma, na realidade é a forma que vai atender 99% dos casos de escalonamento. Escalar por métricas customizadas, ou por volumes de transação é apenas uma decisão que pode ou não caber no seu workload. Entender e comparar as alternativas para usar o autoscale por requisições ao invés do autoscale por consumo de recursos e saturação de recursos é apenas uma parte crucial para abrir a mente para os diferentes tipos de abordagens de escalabilidade existentes em ambientes cloud native.

Porém como todos tipos de tecnologia, temos tradeoffs que podemos considerar: 


### Vantagens

* **Simplicidade**: Fácil de configurar e praticamente todos os recursos de escalabilidade já consideram esse tipo de abordagem como padrão, pois o uso de CPU/Memória é um indicador comum de performance
* **Eficiência**: Garante que os recursos computacionais alocados no cluster para a carga de trabalho estão sendo utilizados de maneira eficiente, diminuindo eventuais desperdicios por recursos subutilizados. 


### Desvantagens

* O uso da CPU/Memória pode não refletir com precisão a carga real da aplicação para serviços de I/O, ou com requisitos específicos.
* A mudança no nível de CPU pode não corresponder **imediatamente** a mudanças na demanda das solicitações da aplicação, causando picos no tempo de resposta até os indicadores de CPU serem acionados para efetuar o escalonamento.

Logo, escolher escalar por quantidade de requisições pode ser desafiador por requerer uma configuração mais detalhada e out of the box das ferramentas convencinais, um conhecimento maior da aplicação e seu comportamento, requerer intrumentações adicionais nas ferramentas que na maioria das vezes costumam ser *plug n' play*, mas pode ser ideal para aplicações mais sensíveis a tráfego que tenham variações bruscas na demanda. 


<br>

# Como definir os thresholds do quanto cada replica suporta?

Como dito acima, é muito complexo responder a essa pergunta, mas existem meios de saber essa informação valiosa. O modo mais indicado é mediante a um teste de carga, no qual o seguinte roteiro pode ser de grande ajuda para elaborar seus testes:

*  **Passo 1:** Em um ambiente proximo de produção coloque as replicas manualmente para 1. Quanto mais proximo do real melhor será a acurácia desse teste em termos de capacity.
*  **Passo 2:**  Estabeleça quais são os limites aceitáveis de tempo de resposta
*  **Passo 3:**  Usando ferramentas como **k6**, **cassowary**, **locust** injete carga aos poucos, para ver com qual volume sua aplicação começa a degradar e inflingir o tempo de resposta aceitável. 
*  **Passo 4:**  Aumente a quantidade de replicas para 2, 3, 4 e repita o exercício para ver se a estimativa se mantem a medida com que o throuput cresce com o número de replicas.
*  **Passo 5:**  A média desses números pode ser interpretado inicialmente com a resposta para "quanto cada replica da minha app suporta". 
*  **Passo 6:**  Claro que existem muitos outros fatores que podem influenciar nesse teste como dependencias, bancos de dados, caches, disco e etc. Então quanto mais você puder mockar essas dependencias melhor. 
*  **Passo 7:**  Esse teste pode evoluir até o ponto em que você encontre o *"hard limit"* de escala da sua arquitetura. Esse número pode ser de grande valia para entender gargalos e planejar a evolução. Podemos falar disso num outro post, é um tema interessante. 


<br>

# Implementação do Keda 

## Encontre a Métrica 

### Istio Service Mesh

```bash
sum(rate(istio_requests_total{destination_service_name="chip"}[1m]))
```

### Nginx Ingress Controller

```bash
rate(nginx_ingress_controller_requests{ingress="chip", namespace="chip"}[1m])
```

### JVM - Micrometer
```bash
sum(rate(requests_total{app="chip", namespace="chip"}[1m]))
```


## Construindo o ScaledObject 


### Janelas de Estabilização 



```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: chip-high-tps
  namespace: chip
spec:
  scaleTargetRef:
    name: chip
  minReplicaCount: 3
  maxReplicaCount: 200
  pollingInterval: 10  
  cooldownPeriod:  30
  advanced:
    horizontalPodAutoscalerConfig:
      behavior:
        scaleDown:
          stabilizationWindowSeconds: 60
        scaleUp:
          stabilizationWindowSeconds: 60          
  triggers:
  - type: prometheus
    metadata:
      serverAddress: http://prometheus-kube-prometheus-prometheus.prometheus.svc.cluster.local:9090
      metricName: istio_requests_total 
      threshold: "10" # <---- Quantidade de requisições por pod. No exemplo, 10 TPS. 
      query: |
        sum(rate(istio_requests_total{destination_service_name="chip"}[1m])) 
```

# Testes e Resultados 

Para essa prova de conceito foi utilizada a ferramenta [Cassowary](https://github.com/casualsnek/cassowary) para injeção de carga. Tentei injetar cargas inconstantes por determinados períodos de tempo para validar as `stabilizationWindowSeconds` curtas para que fosse possível exemplificar o scale bem sensível as métricas de trafego. 

![Scale](/assets/images/keda-tps/tps-keda.png)

# Referencias e Recursos Adicionais

* [Don’t combine ScaledObject with Horizontal Pod Autoscaler (HPA) ](https://keda.sh/docs/2.12/faq/#dont-combine-scaledobject-with-horizontal-pod-autoscaler-hpa)
* [Keda - Scaling Deployments - Advanced](https://keda.sh/docs/2.12/concepts/scaling-deployments/#advanced)
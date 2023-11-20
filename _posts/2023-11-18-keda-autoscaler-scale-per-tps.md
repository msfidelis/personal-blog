---
layout: post
image: assets/images/keda-tps/thumb.jpg
author: matheus
featured: false
published: false
categories: [ keda, kubernetes, containers, cloud-native, capacity, dicas ]
title: Keda - Escalando sua aplicação por requests HTTP usando métricas do Prometheus
---

O [Keda Autoscaler](https://keda.sh/) é uma das minhas tecnologias favoritas da Landscape da [CNCF](https://www.cncf.io/projects/). Considero divertido, sem meias palavras, as possibilidades que ele te proporciona pra trabalhar com autoscaling. 

Em serviços de alta demanda com como **e-commerces**, **instituições financeiras** e **serviços de streaming** o fluxo de requisições é ininterrupto, porém a quantidade das mesmas podem variar dramaticamente em determinados períodos do dia, do mês ou do ano, exigindo que os sistemas subjacentes que atendem essas solicitações acompanhem essa demanda em tempo real, se adaptando rapidamente para manter a perfomance e disponibilidade. 

Nesse artigo rápido vou apresentar uma prova de conceito interessante para propocionar o escalonamento da sua aplicação por meio de demanda, ou seja, requisições de consumo dentro de um período de tempo utilizando o **Keda (Kubernetes Event-driven Autoscaling)** com métricas customizadas do **Prometheus**. 

<br>

# Fundamentos e Premissas

O monitoramento de **TPS/RPS** em ambientes de alta demanda não é apenas uma medida de desempenho, é um indicador muito importante para direcionamentos e tomadas de decisões arquiteturais tanto na concepção de novos serviços quanto na evolução de crescimento dos mesmos. Essa informacão te permite a melhor escolha de estratégias de capacity, desenhos arquiteturais, identificação de gargalos e otimização de recursos.

Para essa prova de conceito, vamos assumir algumas premissas como de costume para que o aproveitamento da mesma a mais objetiva possível.

A ideia é imaginar uma a aplicação muito sensível ao tráfego, que recebe spikes de acesso em períodos aleatórios do dia. Vamos presumir também que já conhecemos algumas informações cruciais para o estudo, como os thresholds que cada pod aguenta sem degradar.

<br>

### Premissas dessa prova de conceito 
* Eu sei que cada réplica da minha aplicação hipotética aguenta, sem se degradar, 10 tps (transações por segundo).
* Essa informação veio por meio de hipotéticos testes de carga que foram realizados de forma prévia.
* Com isso, preciso que minha aplicação tenha 10 replicas no ar a partir de que minhas solicitações cheguem a 100/tps. 
* Da mesma forma como preciso que existam 4 replicas se o fluxo cair para 40/tps. 
* Da mesma forma como preciso que existam 20 replicas se o fluxo subir para 200/tps. 
* Independente do volume de transações, eu nunca posso ter menos que 3 replicas rodando por questões de disponibilidade. 
* E assim vai... 

<br>

# O "Problema" de Escalar por Uso e Saturação de CPU e Memória

Sendo bem direto, não existe nenhum "problema" em escalar utilizando CPU e Memória, na realidade é a forma que vai atender 99% dos casos de escalabilidad horizontal. Escalar por métricas customizadas, ou por volumes de transação é apenas uma decisão que pode ou não caber no seu workload. Entender e comparar as alternativas ao invés do autoscale por consumo de recursos é uma parte crucial para abrir a mente para os diferentes tipos de abordagens de escalabilidade existentes em ambientes cloud native.

Como todos tipos de tecnologia, temos tradeoffs que podemos considerar: 


### Vantagens

* **Simplicidade**: Fácil de configurar e praticamente todos os recursos de escalabilidade já consideram esse tipo de abordagem como padrão, pois o uso de CPU/Memória é um indicador comum de performance
* **Eficiência**: Garante que os recursos computacionais alocados no cluster para a carga de trabalho estão sendo utilizados de maneira eficiente, diminuindo eventuais desperdicios por recursos subutilizados. 


### Desvantagens

* **Orientação a Uso**: O uso da CPU/Memória pode não refletir com precisão a carga real da aplicação para serviços de I/O, ou com requisitos específicos.
* A mudança no nível de CPU pode não corresponder **imediatamente** a mudanças na demanda das solicitações da aplicação, causando picos no tempo de resposta até os indicadores de CPU serem acionados para efetuar o escalonamento.

Logo, escolher escalar por quantidade de requisições pode ser desafiador por requerer uma configuração mais detalhada das ferramentas convencinais, um conhecimento maior da aplicação e seu comportamento, requerer intrumentações adicionais nas ferramentas que na maioria das vezes costumam ser *plug n' play*, mas pode ser ideal para aplicações mais sensíveis a tráfego que tenham variações bruscas na demanda. 


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

Essa configuração também pode vir de um corajoso "chutômetro". 


<br>

# Implementação do Keda 


## Encontrando a Métrica Ideal

Existe uma grande change dessa métrica já existir e já ser muito bem monitorada. Precisamos descobrir qual métrica será utilizada para contabilizar as requisições que nosso Workload está recebendo. Vou deixar uma cola com referencias que podem ser úteis: 

<br>

### Istio Service Mesh

A métrica principal que podemos utilizar para monitorar o trafego de entrada do Istio é a métrica `istio_requests_total` informando o `destination_service_name` que queremos observar. Existem alguns outros parâmetros de configuração como o `reporter`, `source_service_name` que pode tornar os requisitos de escalabilidade ainda mais granular. Mas vamos utilizar o simples para exemplificar: 

```bash
sum(rate(istio_requests_total{destination_service_name="chip"}[1m]))
```

### Envoy Proxy 

Também temos a opção de utilizar o contador `envoy_http_downstream_rq_total` que sumariza os requests recebidos pelo envoy. O Envoy é uma das tecnologias mais versáteis e utilizadas dentro do ecossistema Cloud Native no geral, muita coisa é contruída em cima dele. Então essa métrica pode ser encontrada em diversos tipos de flavors de ingress, sidecars, meshes e ambientes no geral.

```bash
sum(rate(envoy_http_downstream_rq_total{envoy_http_conn_manager_prefix="chip"}[1m]))
```

### Nginx Ingress Controller

Talvez o Ingress Controller mais utilizado pela simplicidade e performance é o Nginx Ingress Controller. O mesmo disponibiliza um contador de requests dentro da métrica `nginx_ingress_controller_requests`. 


```bash
rate(nginx_ingress_controller_requests{ingress="chip", namespace="chip"}[1m])
```

### JVM - Micrometer

Caso esteja utilizando uma aplicação Spring Boot, é comum utilizar o [Micrometer]() como lib de criação e exposição de métricas no actuator da aplicação. Podemos utilizar a métrica `requests_total` que contabiliza os requests que chegaram até a JVM. 

```bash
sum(rate(requests_total{app="chip", namespace="chip"}[1m]))
```


## Construindo o ScaledObject 

### Capacity Mínimo e Maximo

O primeiro passo para construirmos nosso manifesto é saber qual é o mínimo necessário para minha aplicação funcionar independente do uso, e qual o máximo que posso alcançar baseado em custos, hard limits e etc. Nosso mínimo já assumimos nas premissas que é `3` e o maximo iremos trabalhar com `200`. Esses dados devem ser informados nos valores `.spec.minReplicaCount` e `.spec.maxReplicaCount`.


### Janelas de Estabilização 

O `stabilizationWindowSeconds` é um parâmetro importante no KEDA usado para configurar o comportamento do autoscaling diretamente pelo `HPA` que é criado a cada novo `ScaledObject`. Este parâmetro ajuda a estabilizar o processo de escalonamento, evitando mudanças frequentes e potencialmente disruptivas na contagem de réplicas de um deployment, principalmente em resposta a flutuações breves ou picos temporários na carga.

Esse parâmetro é muito importante para o tunning do seu processo de scale, independente de estar usando o Keda ou o HPA diretamente. Seus valores default são de `300` segundos, 5 minutos, o que pode fornecer por padrão uma estabilidade interessante, como também demorada. 

Sugiro sempre apertar o maximo de parafusos possíveis em cima dessa configuração para ajustar pro seu cenário ideal. Para essa Poc desenhei um ambiente que precisa ser super sensível as mudanças de TPS, tanto para aumentar quanto para diminuir o numero de replicas baseadas no tráfego, logo ajustei para `60` segundos, 1 minuto. Logo o Keda poderá tomar uma decisão de escalonamento rapidamente. Se o foco for subir rápido, e descer devagar, é possível ajustar para os dois cenários separadamente também dentro do `horizontalPodAutoscalerConfig`.

### ScaledObject da Aplicação

No final dessas considerações, teremos um manifesto parecido com o abaixo, onde vamos observar a aplicação `chip` que vai variar entre `3` e `200` replicas, e tanto para `scaleUp` quando pra `scaleDown` vai obedecer uma janela de `60` segundos entre as ações.

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

<br>

# Referencias e Recursos Adicionais

* [Don’t combine ScaledObject with Horizontal Pod Autoscaler (HPA) ](https://keda.sh/docs/2.12/faq/#dont-combine-scaledobject-with-horizontal-pod-autoscaler-hpa)
* [Keda - Scaling Deployments - Advanced](https://keda.sh/docs/2.12/concepts/scaling-deployments/#advanced)
* [Keda - Scaling applications based on Prometheus](https://keda.sh/docs/2.12/scalers/prometheus/)
* [Istio Standard Metrics](https://istio.io/latest/docs/reference/config/metrics/)
* [Nginx Ingress Controller - User Guide/Monitoring](https://kubernetes.github.io/ingress-nginx/user-guide/monitoring/)
* [Monitoring Spring Boot Applications with Prometheus](https://blog.kubernauts.io/https-blog-kubernauts-io-monitoring-java-spring-boot-applications-with-prometheus-part-1-c0512f2acd7b)
* [Envoy integration for Grafana Cloud](https://grafana.com/docs/grafana-cloud/monitor-infrastructure/integrations/integration-reference/integration-envoy/)
* [Kubernetes - Horizontal Pod Autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)

[**Me sigam no Twitter para acompanhar os demais materiais que eu compartilho por lá!**](https://twitter.com/fidelissauro)

Te ajudei de alguma forma? Me pague um café (Mentira, todos os valores doados nessa chave são dobrados por mim e destinados a ongs de apoio e resgate animal)

**Chave Pix:** fe60fe92-ecba-4165-be5a-3dccf8a06bfc
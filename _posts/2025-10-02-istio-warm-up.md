---
layout: post
image: assets/images/istio-warm-up-capa.png
author: matheus
featured: false
published: true
categories: [istio, kubernetes, load-balancing, warm-up, rollout, service-mesh]
title: Blueprint - Experimento de Warmup Progressivo com Istio e Argo Rollouts
---

O gerenciamento de tráfego sincrono durante rollouts de aplicações em Kubernetes pode oferecer algum tipo de ruido operacional e refletir na experiência dos clientes, especialmente quando lidamos com aplicações que necessitam de um período de "warm up" antes de atingir sua performance plena. 

Aplicações baseadas em JVM, como Java, Scala e Kotlin, tipicamente enfrentam problemas de performance durante os primeiros momentos de execução. Durante a inicialização, a JVM executa o bytecode no interpretador, consumindo recursos significativos de CPU e resultando em tempos de resposta elevados durante os primeiros momentos do ciclo de vida da aplicação. 

Para amenizar esses casos, podemos utilizar o `warmUp` do `Istio Service Mesh` para garantir um período de aquecimento seguro para os pods novos que forem sendo criados durante os rollouts.

<br>

## Warm Up Configuration no Istio

O Istio implementa uma funcionalidade de **warm-up** através de configurações no `DestinationRule` que permite controlar a distribuição gradual de tráfego para novos hosts com base em distribuição linear. 

### Parâmetros Principais

A configuração de warm-up no Istio utiliza três parâmetros principais:

- **`minimumPercent`**: Define a porcentagem mínima de tráfego que uma nova instância receberá inicialmente 
- **`aggression`**: Controla a velocidade do aumento de tráfego (padrão: 1.0 para crescimento linear)
- **`duration`**: Período de duração do aquecimento. Quanto tempo até a progessão linear irá levar pra chegar em 100%. 

<br>


## Exemplos coletados

No exemplo utilizamos como apoio para rollout progressivo o Argo Rollouts com estratégia de Canary Releases, para realizar uma estratégia de progressão baseada em tempo que deve ser completada em 5 minutos, com pausas de 60s a cada step. 

```yml
    strategy:
      canary:
        steps:
        - setWeight: 10
        - pause: { duration: 60s }
        - setWeight: 20
        - pause: { duration: 60s }
        - setWeight: 40
        - pause: { duration: 60s }
        - setWeight: 60
        - pause: { duration: 60s }
        - setWeight: 80
        - pause: { duration: 60s }
        - setWeight: 100
```

### Experiência de Rollout Sem Warm Up

![no-warm-up](/assets/images/no-warm-up.png)

Sem a configuração de warm-up, novos pods recebem imediatamente uma distribuição proporcional do tráfego total. Para um deployment com 6 replicas, um novo pod receberia instantaneamente 16% do tráfego, potencialmente causando, picos de latência, timeouts durante a inicialização, degradação da experiência e burn rate dos SLO's. 


### Experiência de Rollout com Warm Up

![warm up](/assets/images/warm-up.png)

A experiência com Warm Up foi configurado da seguinte forma:

* **Algoritmo de Balanceamento**: Foi utilizado o algoritmo de Round Robin do Envoy pelas limitações da aplicabilidade do warm up em demais algoritmos
* **Inicialização**: Novo pod recebe apenas 3% do tráfego que deveria receber perante a distribuição padrão
* **Crescimento Gradual**: Tráfego aumenta linearmente, até atingir seu maximo em 5 minutos. Após o período de warm-up de 5 minutos, o pod recebe distribuição normal
* **Agression**: Iremos trabalhar com crescimento de tráfego linear para os novos pods. Valores maiores que 1.0 aceleram o crescimento de tráfego de forma não-linear, enquanto 1.0 mantém linear. 


```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: app-warmup
  namespace: production
spec:
  host: myapp.production.svc.cluster.local
  trafficPolicy:
    loadBalancer:
      simple: ROUND_ROBIN
      warmup:
        minimumPercent: 3.0
        duration: 5m
        aggression: 1.0
```



## Limitações Encontrados

- **Suporte a Load Balancers**: Funciona apenas com `ROUND_ROBIN` e `LEAST_REQUEST`
- **Efetividade em Deployments**: Menos efetivo quando todos os endpoints são novos simultaneamente
- **Escala Mínima**: Mais efetivo quando poucos pods novos são criados por vez


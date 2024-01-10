---
layout: post
author: matheus
# image: https://cdn-images-1.medium.com/max/1024/0*srEMHw3PKt7Ac3_R.png
image: assets/images/argo-logo-vg.png
title: Argo-Rollouts — 'Qual a forma mais simples de executar Canary Releases e Blue/Green Deployments no Kubernetes?'
canonical_url: https://medium.com/@fidelissauro/argo-rollouts-qual-a-forma-mais-simples-de-executar-canary-releases-e-blue-green-deployments-no-e030c2ee3af5?source=rss-fc2fda5e9bc2------2
categories: [ aws, kubernetes, terraform, argo-rollouts ]
---
O Deploy em ambientes **Cloud Native** pode ser, se não é, a parte mais desafiadora no dia a dia do ciclo de vida de um software, principalmente se a atualização é realizada em aplicações criticas que possuem volumes consideráveis de transações.

Nesse contexto, possuímos uma vasta gama de ferramental para gerenciar deployments em ambientes de **Kubernetes**, algumas melhores, outras mais modestas e poucas simples e sucintas.

Existe um ponto de atenção muito importante quando falamos de realizar um deploy em produção: **O rollback**.

Uma frase simples, mas que mudou minha forma de pensar sobre qualquer coisa que eu colocaria a mão quando trato desse tema veio do meu mestre [**Fernando Ike**](https://twitter.com/fernandoike). **_“Mais importante que entregar rápido, é voltar rápido” _** — Algo assim.

Nesses dias um colega de trabalho me fez uma pergunta que me deixou pensativo das ideia, e que pra responder de forma decente, prometi escrever esse artigo:

> **_“Qual a forma mais simples de executar um Canary ou um Blue Green no Kubernetes?”_**

Executar **Canary** e **Blue / Green** eu conheço algumas formas de fazer. Provavelmente você também. Experiência com ferramentas, truques no kubectl e tudo mais não falta por ai. Mas beleza, mas qual das várias possibilidades é a mais simples?

<br>

## O Argo Rollouts

O **Argo Rollouts** é uma ferramenta de automação de implantação em clusters **Kubernetes** que fornece recursos avançados de controle de versão. Ele é projetado para ajudar os desenvolvedores a gerenciar o ciclo de vida de seus aplicativos de maneira mais eficiente e confiável, permitindo que eles implantem novas versões de aplicativos com mais segurança e menos tempo de inatividade. E antes de tudo, de forma simples.

O **Argo Rollouts** é uma extensão do **Argo CD**, outra ferramenta popular de automação de implantação de **Kubernetes**. Ele é construído em cima do controlador de implantação nativo do **Kubernetes** e é compatível com várias plataformas em nuvem, incluindo **AWS**, **Google Cloud** e **Microsoft Azure**.

O **Argo CD** é talvez a ferramenta favorita da maioria das pessoas, eu tento não ser fã de tooling, mas provavelmente é a minha também. Porém, não é simples. As vezes precisamos dar um simples upgrade do que já temos nativamente pra resolver a maioria dos problemas. O **Argo-Rollouts** talvez tenha sido uma resposta a isso.

<br>

## Premissas

A proposta desse post é mostrar o funcionamento básico do Argo-Rollouts resolvendo problemas reais, de forma que consiga ser adaptado ao maior numero de contextos possíveis.

Com excessão do argo-rollouts, não vou focar em nenhuma outra ferramenta que por ventura possa aparecer nesse post.

Todas as possíveis soluções para os problemas apresentados serão apresentados de duas formas:

- Os exemplos desse artigo serão apresentados em forma de perguntas ou requisitos hipotéticos, seguido da implementação que resolveria a questão. Gosto desse tipo de abordagem.
- Utilizarei o modo mais “manual” possível para que as logicas possam ser reaproveitados de forma genérica em qualquer tipo de orquestrador de pipelines que eventualmente faça entregas de software num cluster Kubernetes.
- No final apresentando um componente adicional, da dashboard do argo-rollouts, que pode ser um grande aliado na hora de separar os processos de CI/CD e deixar a progressão dos deploys mais customizáveis e cautelosos.

<br>

### Instalação do Kubectl Plugin

A arquitetura de manipulação do **Argo Rollouts** funciona primeiramente como um **client / server**.

Basicamente, caso você não escreva passos de deployment que se viram sozinhos, baseados em tempo e etc, você precisará utilizar o plugin do kubectl para o rollouts para promover, abortar ou dar rollback de versões. Então entende-se que esse plugin precisa estar instalado no seu orquestrador de pipelines caso necessite gerenciar o ciclo dessa forma.

A instalação, siga o **[Installation Guide](https://argoproj.github.io/argo-rollouts/installation/)** oficial do Argo Rollouts.

{% linkpreview "https://github.com/ysk24ok/jekyll-linkpreview" %}

<br>

### Instalação do Argo-Rollouts

A instalação da ferramenta possui algumas alternativas, mas nesse post iremos abordar o método via Helm. Para as demais, você pode acessar o manual de instalação.

<br>

### Instalação via Helm

A instalação via helm é bem simples e sem segredo.

```bash
helm repo add argo https://argoproj.github.io/argo-helm
helm install argo-rollouts argo/argo-rollouts
```

Para a instalação da Dashboard, será necessário adicionar o parâmetro `--set dashboard.enabled=true`

```bash
helm install argo-rollouts argo/argo-rollouts --set dashboard.enabled=true
```

<br>

### Instalação via Terraform 

Uma opção interessante também é utilizar o provider do helm para o terraform. Como já abordamos esse processo em alguns outros artigos, vou deixar o exemplo aqui também. Certeza que vai ser útil em algum momento pra alguém.

```hcl
resource "helm_release" "argo_rollouts" {
    name                = "argo-rollouts"
    chart               = "argo-rollouts"
    repository          = "https://argoproj.github.io/argo-helm"
    namespace           = "argo-rollouts"
    create_namespace    = true

    set {
            name  = "dashboard.enabled"
            value = "true"
        }
}
```

<br>

## A Estrutura de um Rollout 

Uma coisa que precisa ficar evidente, na lata, quando começamos a utilizar o *Argo-Rollouts*, é que vamos parar de utilizar os manifestos de Deployment. Isso é a premissa inicial da ferramenta, mas calma. É muito simples.

No lugar do que escreveríamos nossos pod templates e replicas, no Deployment vamos começar a utilizar o objeto Rollout, disponível a partir dos CRD's do Argo Rollouts no lugar.

De forma genérica, migraríamos um Deployment convencional que já estamos acostumados disso:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  selector:
    matchLabels:
      app: nginx
  replicas: 10
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - name: http
          containerPort: 80
          protocol: TCP
```

Para algo parecido com o item abaixo, onde temos a mesma estrutura de template/spec para os pods, porém adicionamos o campo strategy onde vamos descrever como será executado os rollouts de versão. Não se atente a esse modelo agora, vamos evoluir bastante o case a seguir:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: nginx-deployment
spec:
  replicas: 10
  revisionHistoryLimit: 2
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - name: http
          containerPort: 80
          protocol: TCP
  strategy:
    canary:
      steps:
      - setWeight: 20
      - pause: {duration: 30}
      - setWeight: 50
      - pause: {duration: 60}
      - setWeight: 80
      - pause: {}
```

<br>

## Canary Release

O **Canary Deployment** é um padrão de deploy onde uma nova versão de uma aplicação é implantada em uma quantidade determinada e progressiva de instâncias para fins de teste e validação a quente antes de ser totalmente implantada em todo o ambiente de produção.

Esse processo também é conhecido sem estrangeirismo como **Canário**. Durante o período de teste, **o tráfego é direcionado para o canário, permitindo que a nova versão do aplicativo seja validada em um ambiente real, mas com um menor risco de interrupção** para o restante dos usuários,** recebendo uma quantidade pequena, porém progressiva, do tráfego** até que seja promovida a versão estável.

**O ideal, é que se houver algum problema durante os testes, a implantação do canário pode ser revertida com facilidade, minimizando o impacto para o restante dos usuários.**

Os **Canary Deployments** são amplamente utilizados em ambientes de produção, especialmente em implantações críticas em que os erros podem ter consequências graves, ou onde **queremos validar um de-para a quente de alguma feature**, modificação, migração. Essa técnica ajuda a garantir a estabilidade e a qualidade do aplicativo, ao mesmo tempo em que permite que as equipes de desenvolvimento e operações **realizem testes e validações com segurança junto ao tráfego real**.

![Canary Image](https://cdn-images-1.medium.com/max/360/1*tcqTyqa0QHGtwrbMphOc0A.gif)

Tentei elaborar mentalmente alguns requisitos de plataforma nos quais o Canary Release proposto pelo **Argo Rollouts** resolveria.

<br>

#### "Eu preciso que meu canário progrida automaticamente 20% a cada 30 segundos sozinho, de depois promova a versão"

Essa talvez seja a abordagem inicial dos espectros do canary automatizado. Temos alguns time-boxes que podem variar de segundos, minutos, horas ou dias e queremos que a progressão da porcentagem do uso progrida dentro desses intervalos. Tudo dependendo do nível de exigência e criticidade da aplicação ou o quão específica e crítica aquela mudança pode ser em relação ao todo.

Então para este primeiro cenário, vamos aplicar o seguinte manifesto, adicionando vários steps com o peso desejado da porcentagem do rollout e informando as pausas desejadas para cada uma das progressões de carga.

```yaml
---
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: chip
  namespace: chip
spec:
  replicas: 10
  strategy:
    canary:
      steps:
      - setWeight: 20
      - pause: {duration: 10}
      - setWeight: 40
      - pause: {duration: 10}
      - setWeight: 60
      - pause: {duration: 10}
      - setWeight: 80
      - pause: {duration: 10}
      - setWeight: 100    
  revisionHistoryLimit: 2
  selector:
    matchLabels:
      app: chip
```


Para acompanhar os rollouts localmente, vamos utilizar a função watch do plugin do argo que instalamos no kubectl, onde podemos acompanhar a devida progressão dos pods entre as duas versões.

```bash
kubectl argo rollouts get rollout chip -n chip --watch
```


![Canary Release Progression Image](https://cdn-images-1.medium.com/max/1024/1*5QYh21jVsmbiPI-hnPp99Q.png)

Para ilustrar, na imagem abaixo tem um loop de consumo de uma API que retorna a devida versão da mesma. Assim podemos acompanhar visualmente como funciona a progressão a quente para os consumidores do serviço em questão. Vamos usar essa abordagem a partir daqui.

![API Version Loop Image](https://cdn-images-1.medium.com/max/1024/1*SLN877naES-VpjuZTo3wJg.png)

Após todos os steps finalizarem, teremos nossa revision:2 marcada como stable e a revision:1 descontinuada. Porém ela vai ficar ali podendo ser reativada num possível rollback. Trataremos disso mais pra frente.

![Revision Update Image](https://cdn-images-1.medium.com/max/1024/1*u5b1Lc6AlPtr4VzpsswUVw.png)

Visualmente, durante nossas interações com as requisições que retornam a versão da aplicação de teste, podemos ver ela totalmente promovida:

![Application Version Promotion Image](https://cdn-images-1.medium.com/max/1024/1*LRHFBPBs7WqJSXCeTrnkvA.png)

[Exemplo completo — Github](https://github.com/msfidelis/argo-rollouts-article/blob/main/canary/canary-auto-progressive.yml)

<br>

#### “Eu preciso que meu canário progrida sozinho até 80%, porém eu gostaria de promover ou abortar o restante manualmente”

Um outro tipo de cenário de uso é uma progressão gradual controlada, porém que seja necessária uma intervenção humana para progressão da release em si. Nesse cenário hipotético, vamos imaginar que eu gostaria que a progressão funcione como o primeiro exemplo, de x em x tempo, porém pare em 80%. E a partir daí, alguém aprova ou aborta a mudança de versão.


```yaml
---
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: chip
  namespace: chip
spec:
  replicas: 10
  strategy:
    canary:
      steps:
      - setWeight: 20
      - pause: {duration: 10}
      - setWeight: 60
      - pause: {duration: 10}
      - setWeight: 80
      - pause: {}  
  revisionHistoryLimit: 2
  selector:
    matchLabels:
//...
```


Nesse caso, temos a opção de colocar uma instrução de pause sem uma duração definida, e nosso rollout entrará num status de Paused indefinidademente quando chegar no step. Nesse caso em especifico, precisaremos dar uma instrução para o argo manualmente continuar o rollout, ou abortá-lo e retornar a versão anterior.

![Imagem do Argo Rollouts](https://cdn-images-1.medium.com/max/1024/1*LkFudHsvWPSvLOzw95TRdA.png)

Essas instruções são os comandos `promote` e `abort` também vindos do plugin do Argo Rollouts. O `promote` irá progredir o step atual, o `abort` irá cancelar o rollout e retornar todos os pods da aplicação para a versão anterior.

Um adendo ao abort é que ele pode ser executado em qualquer momento do ciclo de vida do rollout.

```bash
kubectl argo rollouts promote chip -n chip
kubectl argo rollouts abort chip -n chip
```

[Exemplo Completo — Github](https://github.com/msfidelis/argo-rollouts-article/blob/main/canary/canary-final-promote.yml)


<br>

#### “Eu preciso que meu canário progrida até 20%, depois necessite de uma intervenção manual para continuar o rollout”

Esse processo é exatamente igual ao anterior, porém vamos pensar num case onde eu queria ser um pouco mais conservador e chato quanto ao meu rollout, e queria promover uma pequena porcentagem para o meu canary, olhar minha observability, acompanhar com mais calma antes de prosseguir com o rollout automatizado. Nesse caso somente precisamos adicionar o step pause depois de promover a primeira porcentagem. Assim precisaremos dar o `promote` para prosseguir, ou o `abort` logo de começo.

 ```yaml
---
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: chip
  namespace: chip
spec:
  replicas: 10
  strategy:
    canary:
      steps:
      - setWeight: 20
      - pause: {}
      - setWeight: 40
      - pause: {duration: 10}
      - setWeight: 60
      - pause: {duration: 10}
      - setWeight: 80
      - pause: {duration: 10}
      - setWeight: 100      
  revisionHistoryLimit: 2
  selector:
    matchLabels:
//...
 ```


![Imagem do Argo Rollouts](https://cdn-images-1.medium.com/max/1024/1*hOONNhP8CjNjtG24F5CChw.png)

```bash
kubectl argo rollouts promote chip -n chip
```


Uma abordagem que deriva dessa é fazer o inverso, promover automaticamente até uma porcentagem menor, e pedir uma intervenção manual para progredir automaticamente até a estabilização da versão.

[Exemplo Completo — Github](https://github.com/msfidelis/argo-rollouts-article/blob/main/canary/canary-initial-promote.yml)

<br>

#### "Eu gostaria que meu canário tivesse passos de 10 em 10%, mas que eu consiga promover todos manualmente"

Pra uma abordagem mais conservadora e crítica, é possível que os rollouts aconteçam de forma contínua com baixa progressão de volume, em que cada step seja promovido manualmente.

Esse cenário é interessante pra produtos que sejam extremamente sensíveis a falhas com volumes altos de clientes e que possam gerar prejuízos grandes em casos de erro. Em todo caso, uma abordagem mais cuidadosa.

Imagine nesse cenário acima, você está trocando a API de um fornecedor, fez alguma melhoria de performance, trocou um flavor de banco, algum driver, atualizou versão de framework e etc, e gostaria que esse rollout acontecesse de forma extremamente validada.

Nesse caso, vamos utilizar o step pause em seguida de cada progressão de porcentagem do rollout, sem as definições de duration. Nesse sentido em cada promoção de step, o argo vai paus

<br>

## Blue / Green Deployments

O **Blue/Green Deployment**, é diferente do **Canary** em sua concepção, no qual cumpre o objetivo de realizar uma validação prévia do deploy. **A diferença para o canary, é que a a nova versão do aplicativo é implantada em paralelo ao ambiente de produção atual (ambiente Blue), sem afetar o tráfego do usuário da versão estável (ambiente Green)**, porém é configurada uma rota customizada para que seja possível realizar testes durante o processo de deploy antes de promover a versão nova.

A estratégia **Blue/Green Deployment** é comumente usada em ambientes de alta disponibilidade, onde interrupções ou erros no ambiente de produção podem ter um grande impacto na experiência do usuário, basicamente **é a melhor opção onde a aplicação é muito sensível a erros no geral**. Essa técnica tem muito a agregar na maior parte do tempo, porém é considerada um pouco mais cara, e não permite fazer uma validação gradual de uma feature com o cliente real, por exemplo.

![Blue/Green Deployment](https://cdn-images-1.medium.com/max/611/1*k0d5ugLsZ76poUtbAfoUHQ.gif)

<br>

### Configuração Inicial do Service para o Blue/Green

Diferente do modelo do canary que utiliza o mesmo Service precisamos de antemão criar 2 services, um que vai representar a versão active e outra que funcionará como a versão preview, ou trazendo pro termo genérico um será a versão blue e outra será a versão green.

```yaml
---
apiVersion: v1
kind: Service
metadata:
  name: chip-active
  namespace: chip 
  labels:
    app.kubernetes.io/name: chip
    app.kubernetes.io/instance: chip 
spec:
  ports:
  - name: web
    port: 8080
    protocol: TCP
  selector:
    app: chip
  type: ClusterIP
```

```yaml
---
apiVersion: v1
kind: Service
metadata:
  name: chip-preview
  namespace: chip   
  labels:
    app.kubernetes.io/name: chip
    app.kubernetes.io/instance: chip 
spec:
  ports:
  - name: web
    port: 8080
    protocol: TCP
  selector:
    app: chip
  type: ClusterIP
---
```

![Blue/Green Image](https://cdn-images-1.medium.com/max/1024/1*ffmwP6LRX5I6mKjeqS6mhQ.png)

Também será necessário criar **duas rotas no seu ingress**, uma para validação no seu **preview** e outra para a versão **ativa**, algo parecido. No Istio, teríamos algo parecido com isso:

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: chip-gateway
  namespace: chip
spec:
  selector:
    istio: ingressgateway 
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - "chip.k8s.raj.ninja"
---
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: chip-gateway-preview
  namespace: chip
spec:
  selector:
    istio: ingressgateway 
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - "chip-preview.k8s.raj.ninja"
```

<br>

### “Eu gostaria de ter a capacidade de validar minha versão Green através de uma rota específica, e promover manualmente”

Escrevendo nosso rollout de **blue/green**, precisamos parametrizar inicialmente o `activeService` e o `previewService` de forma com que nosso rollout saiba quais services controlar durante as viradas de cargas e validação.

E como a proposta desse cenário é validar e promover manualmente depois de certas validações, é importante setar o parâmetro `autoPromotionEnabled` como `false`.

```yaml
---
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: chip
  namespace: chip
spec:
  replicas: 10
  strategy:
    blueGreen: 
      activeService: chip-active
      previewService: chip-preview
      autoPromotionEnabled: false
  revisionHistoryLimit: 2
  selector:
    matchLabels:
      app: chip
  template:
//...
```

Ao aplicar uma nova versão configurada como blue/green, o Argo mantém ambas as versões operando simultaneamente, com a mesma capacidade, aguardando side by side.

![Image](https://cdn-images-1.medium.com/max/1024/1*soutJkhPms5-q9VPZp2tYw.png)

A configuração do seu ingress deve ser configurada para permitir o acesso às versões de diversas maneiras, seja por header, path, host ou outros métodos.

![Image](https://cdn-images-1.medium.com/max/1024/1*5FAp5ceaE7E8d1xFjue90g.png)

Para monitorar a transição entre as versões, vamos criar um loop para consumir ambas as versões da API em paralelo.

![Image](https://cdn-images-1.medium.com/max/1024/1*nvr4T2jpKlyyDpfkve1nPg.png)

Após validar os comportamentos, podemos promover a nova versão da seguinte maneira:

```bash
kubectl argo rollouts promote chip -n chip
```

![Image](https://cdn-images-1.medium.com/max/1024/1*W3X3pHr-e019T-qtk4jSAg.png)

Agora aguardaremos até a versão revision:2 estabilizar.

![Image](https://cdn-images-1.medium.com/max/1024/1*_xnSKI8PAR8o-DU6S1qGaw.png)

[**Exemplo Completo — Github**](https://github.com/msfidelis/argo-rollouts-article/blob/main/blue-green/blue-green-manual-promote.yml)

<br>

#### "Eu gostaria de que minha versão de preview recebesse alguns requests para warm up do meu runtime ou realizar testes antes de promover para a versão ativa"

O interessante do Blue Green é que ele trabalhe de forma com que você consiga validar o comportamento da sua versão nova manualmente, por processos automatizados, ferramentas de teste antes de promover a versão nova para o cliente final.

Neste cenário irei realizar uma ferramenta de **HTTP Bench** para realizar um número considerável de requests para minha versão nova afim de simular um “**_warm up_**” do runtime. **Esse processo pode ser interessante para workloads criados em JVM que precisam de uma “esquentada” nos primeiros instantes de vida para performar da melhor forma**.

Uma ideia interessante é utilizar seus testes de fumaça de forma containerizada, subir seu roteiro num container e executá-lo da mesma forma.

Precisamos criar um AnalysisTemplate descrevendo que tipo de análise vamos realizar para dar uma flag na nossa versão. Nesse caso vou executar um container do cassowary em uma rota qualquer do meu serviço, simulando um endpoint de verdade que precise desse tipo de estratégia.


```yaml
---
kind: AnalysisTemplate
apiVersion: argoproj.io/v1alpha1
metadata:
  name: chip-http-warm-up
  namespace: chip
spec:
  metrics:
  - name: http-bench-analysis
    failureLimit: 1
    provider:
      job:
        spec:
          backoffLimit: 1
          template:
            metadata:
              labels:
                istio-injection: disabled
                sidecar.istio.io/inject: "false"
            spec:
              containers:
              - name: http-bench-analysis
                image: rogerw/cassowary:v0.14.0
                command: ["cassowary"]
                args: ["run", "-u", "<http://chip-preview.chip.svc.cluster.local:8080/healthcheck>", "-c", "3", "-n", "1000"]
              restartPolicy: Never
    count: 1
---
```

Agora no nosso rollout, vamos utilizar o prePromotionAnalysis passando o nosso AnalysisTemplate criado

```yaml
---
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: chip
  namespace: chip
spec:
  replicas: 10
  strategy:
    blueGreen: 
      activeService: chip-active
      previewService: chip-preview
      autoPromotionEnabled: false
      prePromotionAnalysis:
        templates:
        - templateName: chip-http-warm-up
  revisionHistoryLimit: 2
  selector:
    matchLabels:
// ...
```
![Image](https://cdn-images-1.medium.com/max/1024/1*IGunLxEntRZjAf3HKM62Rw.png)

Podemos validar o seguinte cenário coletando algumas métricas dos dois services. Também é uma boa prática acompanhar as duas versões em paralelo no momento de um rollout. Nesse caso, podemos ver um pico de requisições acontecendo no service preview conforme parametrizado no AnalysisTemplate.

![Image](https://cdn-images-1.medium.com/max/1024/1*JJ7nGOb7LYlQ8X3yrUQNsQ.png)

Agora que já temos nosso warm up finalizado, vamos promover nosso rollout com nossos hipotéticos runtimes warmados para receber o tráfego real.

```bash
kubectl argo rollouts promote chip -n chip
```

![Image](https://cdn-images-1.medium.com/max/1024/1*STUTJ3kuVkDbu4IrNAaVPA.png)

[Exemplo Completo — Github](https://github.com/msfidelis/argo-rollouts-article/blob/main/blue-green/blue-green-pre-warm-up.yml)

<br>

#### “Preciso executar uma bateria de testes na minha versão de preview, e criar uma análise de métricas automatizada para validar se a versão está saudável. É possível?”

Sim, assim como podemos criar um **AnalysisTemplate** pra executar os testes, podemos criar outro em seguida que a partir de métricas do Prometheus, consegue dar um sinal verde ou vermelho pra nossa aplicação finalizar o rollout. Nesse caso seria interessantes tanto o **_autoPromote: false_** como o **_autoPromote: true_** para workloads que tenham mais confiança.

Vamos reaproveitar o **AnalysisTemplate** do exemplo anterior nesse aqui como uma continuidade.

Além dele vamos criar um outro template onde vamos definir uma query **PromQL** que será executada em uma instância de prometheus que esteja agregando as métricas do nosso cluster.

Para isso vamos precisar configurar algumas coisas, sendo elas o provider do prometheus onde vamos informar a URL do Prometheus, nesse caso tenho uma instancia rondando no meu cluster então informarei a URL do service.

Em seguida vamos definir qual será a query de consulta. No caso do exemplo estou fazendo um calculo de **SLO** de disponibilidade avaliando os 5 ultimos minutos.

Por ultimo vamos informar o successRate onde vamos colocar uma condição do teste ser aceito ou não.


```yaml
---
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: chip-error-rate-check
  namespace: chip
spec:
  metrics:
  - name: success-rate
    interval: 2m
    successCondition: result[0] >= 0.95
    failureLimit: 1
    provider:
      prometheus:
        address: <http://prometheus.istio-system.svc.cluster.local:9090>
        query: |
          sum(irate(
            istio_requests_total{destination_service=~"chip-preview.chip.svc.cluster.local",response_code!~"5.*"}[5m]
          )) /
          sum(irate(
            istio_requests_total{destination_service=~"chip-preview.chip.svc.cluster.local"}[5m]
          ))
    count: 1          
---
```

Como no exemplo anterior, adicionar apenas mais um step após o nosso **_“smoke test”_** avaliando as métricas de disponibilidade do mesmo:


```yaml
---
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: chip
  namespace: chip
spec:
  replicas: 10
  strategy:
    blueGreen: 
      activeService: chip-active
      previewService: chip-preview
      autoPromotionEnabled: false
      prePromotionAnalysis:
        templates:
        - templateName: chip-http-warm-up
        - templateName: chip-error-rate-check
  revisionHistoryLimit: 2
  selector:
    matchLabels:
      app: chip
  template:
    metadata:
//...
```

Aplicando iremos ver correr o blue/green como já estamos acostumados, porém com um adicional no qual iremos ver rodando os AnalysisTemplates, um que vai executar nossos testes / warm up e o do Prometheus que irá sumarizar as métricas do teste.

![Image](https://cdn-images-1.medium.com/max/1024/1*7miYjtv-yKivNl7b0QUf5Q.png)

Para maiores informações a respeitos das análises que fazemos através dos templates, podemos verificar os objetos AnalysisRun

```bash
kubectl get analysisrun -n chip
kubectl describe analysisrun <id> -n chip
```


![Image](https://cdn-images-1.medium.com/max/1024/1*BOWwgv5nyi9_x07tTXNO1Q.png)

[Exemplo Completo — Github](https://github.com/msfidelis/argo-rollouts-article/blob/main/blue-green/blue-green-prometheus-analysis-auto.yml)

<br>

### Rollbacks de Versões Anteriores

É uma premissa do canary que seja possível validar a nova versão aos poucos e a partir do tráfego do cliente conseguir validar o sucesso de uma implantação. Esse sucesso pode ser medido de diversas formas, a olho nú ou de formas automatizadas como pudemos ver nesse artigo.

Mas independente do modelo de deployment aplicado no no produto, é muito importante que existam ferramentas que possibilitem alternativas de rollback de forma rápida. Repetindo mais uma vez: **_"Melhor que entregar rápido, é voltar rápido"_**

Vamos imaginar um cenário hipotético em que uma release de canário começou a ser promovida e durante os steps, podemos identificar que uma taxa de erros incomum começou a subir junto a progressão dos steps.

![Image](https://cdn-images-1.medium.com/max/1024/1*l8Y9zbrzrTU85IFnlRQ8uw.png)

Como já vimos, existe a opção abort para reverter um rollout durante sua execução, podendo ser executado a qualquer momento.


```bash
kubectl argo rollouts abort chip -n chip;
```


![Image](https://cdn-images-1.medium.com/max/1024/1*ON6fbKMuy_og9Gndqsi-sA.png)

Já vimos essa dinâmica antes, mas fui um pouco repetitivo propositalmente para mostrar uma alternativa pra quando a versão com erro já foi promovida e estabilizada e será necessário um rollback.

<br>

#### “Mesmo com o canário ou blue/green, eu comi bola e por um comportamento não previsto, preciso voltar a versão anterior rápido”

O comando de abort pode ser executado em qualquer momento do ciclo de vida de implementação do Rollout, porém quando a versão é promovida para stable o processo é um pouco diferente.

Depois de uma implantação finalizada, é necessário o rollout de uma versão anterior do zero, nesse caso iremos utilizar o comando… pasmem, chamado rollback.

Após o inicio do rollback será realizado um rollout novo, promovendo a versão anterior.

```bash
kubectl argo rollouts rollback chip -n chip;
```


Tanto no caso anterior do abort quando nessa do rollback o resultado final de uma implantação que teve um plano de retorno deverá ser parecida com a abaixo, onde a taxa de erro anômala identificada retorna aos níveis normais da aplicação.

![Image](https://cdn-images-1.medium.com/max/1024/1*hRJMhCSA6LOBOeChbf7oHw.png)

<br>

### Horizontal Pod Autoscaler / Vertical Pod Autoscaler

Agora vamos para algumas dicas úteis pra resolver alguns problemas que você venha a encontrar durante seus testes e migração do Argo. Caso você esteja utilizando **HPA/VPA** em seu workload, será necessário fazer algumas modificações no objeto do **HorizontalPodAutoscaler** e **VerticalPodAutoscaler** alterando o **scaleTargetRef** trocando o apiVersion de apps/v1 para [argoproj.io/v1alpha1](<http://argoproj.io/v1alpha1>) e o Kind de Deployment para Rollout , assim conseguimos acertar as referencias.

```yaml
---
apiVersion: autoscaling/v2beta2
kind: HorizontalPodAutoscaler
metadata:
  name: chip
  namespace: chip
spec:
  maxReplicas: 10
  minReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 60
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: chip
---
```

Para isso

```yaml
---
apiVersion: autoscaling/v2beta2
kind: HorizontalPodAutoscaler
metadata:
  name: chip
  namespace: chip
spec:
  maxReplicas: 10
  minReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 60
  scaleTargetRef:
    apiVersion: argoproj.io/v1alpha1
    kind: Rollout
    name: chip
---
```

<br>

### Dashboard, uma alternativa mais amigável para acompanhamento dos rollouts.

Para acessar a dashboard será necessário também expor o pod argo-rollouts-dashboard no seu ingress. Como no caso estou utilizando Istio, o exemplo seria esse:


```yaml
---
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: argo-dashboard
  namespace: argo-rollouts
spec:
  selector:
    istio: ingressgateway 
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - "argo-rollouts-dashboard"
    - "dashboard-argo.k8s.raj.ninja"
---
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: argo-dashboard
  namespace: argo-rollouts
spec:
  hosts:
  -  "argo-rollouts-dashboard"
  -  "dashboard-argo.k8s.raj.ninja"
  gateways:
  - argo-dashboard
  http:
  - route:
    - destination:
        host: argo-rollouts-dashboard
        port:
          number: 3100
    retries:
      perTryTimeout: 500ms
      retryOn: 5xx,gateway-error,connect-failure,refused-stream
---
```

Agora tendo acesso a dashboard, podemos utilizar a mesma para manipular nossos rollouts de forma visual, podendo abortar, promover, acompanhar e dar rollback a qualquer momento com poucos clicks.

![Imagem](https://cdn-images-1.medium.com/max/1024/1*dZPgKUJ6CtxiSJLN0SLTaQ.png)
![Imagem](https://cdn-images-1.medium.com/max/1024/1*XGAOPwyKSbsjIUVF0Ky4BQ.png)

**Referencias / Materiais de Apoio**
- [Argo-Rollouts — Site Oficial](https://argo-rollouts.readthedocs.io/en/stable/)
- [Argo-Rollouts — Analysis Template](https://argo-rollouts.readthedocs.io/en/stable/features/analysis/)
- [Argo-Rollouts — Prometheus Provider](https://argo-rollouts.readthedocs.io/en/stable/analysis/prometheus/)
- [BlueGreenDeployment — Martin Fowler](https://martinfowler.com/bliki/BlueGreenDeployment.html)
- [Software Delivery Guide](https://martinfowler.com/delivery.html)
- [Kubernetes Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [ArgoProject — Argo Rollouts](https://argoproj.github.io/argo-rollouts/FAQ/)

**Obrigado aos revisores:**
- Carlos Panato — [@comedordexis](https://twitter.com/comedordexis)
- Bernardo — [@indiepagodeiro](https://twitter.com/indiepagodeiro)
- Caio Volpato — [@caioauv](https://twitter.com/caioauv)
- Diego Murta Freire — [@diegomurta](https://twitter.com/diogomurta)
- Marcelo Freire — [@marcelofreire28](https://twitter.com/marcelofreire28)


Me [sigam no Twitter](https://twitter.com/fidelissauro) para acompanhar as paradinhas que eu compartilho por lá!

Te ajudei de alguma forma? Me pague um café (Mentira, todos os valores doados nessa chave são dobrados por mim e destinados a ongs de apoio e resgate animal)

**Chave Pix:** fe60fe92-ecba-4165-be5a-3dccf8a06bfc



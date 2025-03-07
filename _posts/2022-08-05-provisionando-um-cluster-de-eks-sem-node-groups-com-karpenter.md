---
layout: post
title: Provisionando um cluster de EKS sem Node Groups com Karpenter
canonical_url: https://medium.com/@fidelissauro/provisionando-um-cluster-de-eks-sem-node-groups-com-karpenter-4d302b32b620?source=rss-fc2fda5e9bc2------2
# image: https://cdn-images-1.medium.com/max/1024/0*ZQy5ZyZidbgJThzP.png
image: assets/images/capa-karpenter-groupless.png
author: matheus
featured: false
categories: [ aws, arquitetura, kubernetes, terraform, karpenter ]
---
_A proposta dessa PoC é criar e gerenciar um cluster de EKS utilizando apenas (ou quase) o **Karpenter** como provisionamento de recursos computacionais pro Workload produtivo, tirando a necessidade de Node Groups e Auto Scale Groups._ Trazendo todo o gerenciamento de recursos pra dentro de CRD's do **Karpenter**.

**Nesse cenário vamos assumir algumas premissas importantes:**

- O objetivo do **Karpenter** como tecnologia é prover um "just in time" scale, o que faz dele uma proposta interessante para workloads que tenham picos de acesso, processamentos agendados mais pesados e tenham um delta de escalabilidade computacional mais agressivos.
- Essa proposta é excelente para muitos casos de uso, mas também é preciso assumir que gera uma volatilidade muito brusca na quantidade de nós e pods. Por isso é ideal que as aplicações e suas dependências estejam preparadas para morrer com segurança e aumentar ou diminuir o consumo de recursos na mesma proporção.
- Como um cluster de Kubernetes é composto por várias "pecinhas de lego" muito importantes, e que muitas vezes não estão preparadas para lidar com essa volatilidade agressiva para qual essa PoC está sendo desenhada, o modo mais intuitivo que trouxe para resolver esse cenário foi colocar os namespaces de serviço, como **prometheus**, kube-system e outras aplicações "satélites" em nodes Fargate, para que eles sejam poupados dessas mudanças bruscas de capacity.

<br>

# Provisionamento

Vou omitir bastante detalhes do código como um todo para não transformar esse artigo numa bíblia, mas fique tranquilo que todo o desenvolvimento está sendo documentado [neste repositório do GitHub](https://github.com/msfidelis/eks-karpenter-autonomous-cluster).

<br>

## Roles de IAM

Antes de qualquer coisa vamos precisar provisionar uma série de roles com as permissões necessárias para o provisionamento dos recursos e configurações dos componentes. Como qualquer cluster de Kubernetes vamos precisar providenciar com antecedência 3 tipos de roles. Uma para o Control Plane, outra que será usada como Instance Profile para as instâncias dos Nodes e outra para os Fargate Profiles.

#### Roles de IAM — Cluster

Iniciando pela role do Control Plane precisamos associar 2 managed policies, **AmazonEKSClusterPolicy** e **AmazonEKSServicePolicy**.

{% gist 6bcc50e984845bc4231b4a894484705d %}

<br>

#### Roles de IAM — Nodes / Instance Profile

O provisionamento da Instance Profile dos nodes também não muda caso você fosse usar com Node Groups, com exceção de que vamos precisar criar a instance profile propriamente dita. Quando utilizamos Node Groups o próprio serviço do EKS se encarrega de fazer a criação desse recurso caso não exista previamente. Mas é simples.

Vamos precisar associar algumas Managed Policies padrão também para funcionar. Mas sem segredo de outros tipos de provisionamento.

{% gist c9aeff3c103d324508aadcb5acf175aa %}

Vamos criar uma associação de instance profile na role criada para os nodes para posteriormente criamos o Launch Configuration com ela.

{% gist 496af72dba1c7bee474b254d6ec4be0b %}

<br>

#### Roles de IAM — Fargate Profiles

O provisionamento da role dos Fargate Profiles também é padrão. Escrevendo esse artigo me vem aquela sensação de "pow, essas roles já poderiam existir na conta por default né? Chatão". Pois é.

Funciona no mesmo esquema das anteriores, precisamos anexar algumas managed policies padrão para que o serviço funcione.

{% gist ec44c3b441302e2cf0d67e415a13f103 %}

<br>


## EKS Cluster

O provisionamento do cluster foi feito sem a base de um modulo ou facilitador. Até mesmo porque não seria interessante provisionar nada além do próprio control plane do EKS para PoC nesse primeiro momento.

Vamos utilizar o recurso base do **aws_eks_cluster** nos atentando as tags de discovery do Karpenter que precisam estar presentes.

{% gist 1dfab0ee9ac6cc62fd0c60d482e83b47 %}

<br>

## Fargate Profile — Kube System

Como dito anteriormente nas premissas da PoC, tudo que se encaixar como um componente sistêmico do funcionamento da plataforma, e não como parte do workload será provisionado em **_Fargate Profiles_** para poupá-los da volatilidade de scale in / scale out que iremos trazer para o cluster com o Karpenter. Dito isso, vamos provisionar o fargate profile para o namespace do **_kube-system_**.

{% gist a52e4ef23209e91fee7d8e7b9e5bc82b %}

<br>

## CoreDNS Fix — Workaround

Uma das coisas mais chatas e sem sentido do uso de cluster Full Fargate é a limitação do **_CoreDNS_** de subir naturalmente em nodes que não sejam EC2 efetivamente. Até a data desse artigo, é necessário utilizar de algum artificio automatizado ou manual para remover a label de **_eks.amazonaws.com/compute-type_** de ec2 para que ele consiga ser provisonado em nodes fargate.

Você pode fazer isso manualmente sem problemas diretamente com o kubectl.

```bash
kubectl patch deployment coredns -n kube-system --type json -p='[{"op": "remove", "path": "/spec/template/metadata/annotations/eks.amazonaws.com~1compute-type"}]'
```

_Porém como preguiça pouca é besteira_, eu vou utilizar uma lambda que após o provisionamento do cluster se encarrega de remover essa label através da API do control plane.

Peguei a base inicial dessa lambda através do artigo [Deploy CoreDNS on Amazon EKS with Fargate automatically using Terraform and Python](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/deploy-coredns-on-amazon-eks-with-fargate-automatically-using-terraform-and-python) escrito por **Kevin Vaughan** e **Lorenzo Couto** da AWS. Porém fiz algumas modificações de _stepback_ e _retry_ para realização dessa configuração porque algumas vezes falhava nas primeiras tentativas pela API não estar tão disponível quanto deveria.

O provisionamento dela está em um repositório de exemplo separado para ajudar em casos isolados e também futuramente transformar em módulo que resolve esse problema. _Dor de cabeça pro Matheus do futuro_.

No caso no Terraform iremos empacotar o script normalmente e criar a lambda na VPC que entregamos o cluster.

{% gist d82bc4d1c33c8d0033046d02725bc31a %}


Nenhuma trigger é necessária para esse primeiro momento. Ao invés disso na pipeline vamos chamar um **_aws_lambda_invocation_** passando o _endpoint_ do cluster e um _token_ temporário que será utilizado para fazer o request com o Patch removendo a label. Isso irá forçar um redeploy do coreDNS, porém fazendo ele subir em nodes fargate com o planejado na própria execução da pipeline. Ganhando bastante tempo e diminuindo "gols de mão" do processo.

{% gist 3d97ca827575c52cd0cd68fb0c9db3e9 %}


[GitHub - msfidelis/eks-coredns-fargate-fix: Lambda setup to fix CoreDNS deployments to run on Fargate Clusters](https://github.com/msfidelis/eks-coredns-fargate-fix)

<br>

## Provisionamento do Karpenter

O provisionamento do Karpenter com Terraform e Helm não tem segredo. Exemplo foi adaptado direto da excelente documentação do projeto. São passos bem semelhantes dos que vimos até agora. Onde será necessário providenciar uma Role para o serviço com um assume role federado para o OIDC do cluster (exemplo completo no repositório).

<br>

#### IAM Role

A role do karpenter precisa ter algumas permissões bem semelhantes ao Cluster Autoscaler caso você já tenha utilizado. Ele precisa de algumas permissões de controle de EC2 para poder lançar e deletar elas sob demanda. Sem segredo por aqui.

{% gist ebcc3ea5a2e13d30f31567ce9cef9e7c %}

<br>

#### Karpenter — Fargate

Segundo passo é colocar o Karpenter para rodar em Fargate Profile semelhante como fizemos com o **_kube-system_**, para impedir de que um _drain_ de nodes afete o próprio karpenter e dê algum problema no processo de uma forma geral. Então, seguindo a premissa de que se não é workload, está seguro em fargate, vamos subir ele também.

{% gist 3d4fa972304525652b5e0118e698ca88 %}

<br>

### Karpenter — Helm

O Setup do Helm é baseado no da documentação do Karpenter com Terraform também. Vamos passar a role que criamos amarrada ao OIDC e ao **_WebIdentityProvider_** na Service Account para que o controlador possa executar operações nas API's da AWS.

{% gist 79a5fdb0445fa0e2a9efbad4e5a0cb1b %}


![Karpenter Image](https://cdn-images-1.medium.com/max/770/1*VAlTbC20qhEBdkBWfcJ0Ag.png)

Após o provisionamento teremos também o pod do Karpenter com os dois containers internos em estado de Ready/Running rodando em um Node Fargate idêntico aos do exemplo do **_kube-system_**.

<br>

### Karpenter — Provisioner e Templates

Agora vamos trabalhar com o real diferencial dessa PoC com os demais tipos de provisionamento mais comuns. Caso você já tenha trabalhado com o provisionamento de clusters de EKS com Node Groups com Launch Templates customizados, essa parte será bem parecida.

No caso vamos criar um launch template versionado utilizando as AMI's recomendadas da AWS e a instance profile que criamos de antemão. Alguns passos de configuração como user-data foram omitidos do artigo, mas ressaltando que podem ser consultados no repositório de exemplo do artigo.

{% gist f3ba98e06fcb612f2dadd276098bcdb0 %}

Em seguida vamos criar dois objetos pelo objeto **_kubectl_manifest_** do provider do kubectl para fazer deploy de dois recursos do CRD do Karpenter, um deles sendo o Provisioner onde vamos especificar os tamanhos de instancias, limites de CPU e memória e coisas relacionadas a capacity e outro sendo um AWSNodeTemplate onde vamos especificar os launch templates dos nodes.

{% gist 0d22da87de84530d130b9173a087375a %}

Para facilitar eu optei por usar **_templatefile_** para criar os manifestos que seriam aplicados pelo provider do kubectl. No caso para ficar mais evidente, coloquei algumas variáveis para fazer o build dos YAMLs via template dessa forma:

{% gist a4b9eb55b5335b7d78d4c30e2a2746d0 %}

{% gist a632e2bb18ca95c72fc597c37784c860 %}

No final será criado um resource parecido com o abaixo:

{% gist 5f44a5231cd54d0876a9c14d08d8e4b2 %}

**Disclaimer:** _Durante a PoC tentei utilizar o provider do kubernetes para criar os objetos customizados do Karpenter diretamente pelo kubernetes_manifests, porém existe um bug de dependências no resource que inviabiliza o provisionamento de CRD's juntamente com o cluster. Por isso precisei utilizar o kubectl provider para que continue sendo possível o provisionamento de toda a infraestrutura de uma única vez._

_Abri uma issue que permanece aberta (até esse momento) pra isso:_

[Error: Failed to construct REST client on kubernetes_manifest resource · Issue #1775 · hashicorp/terraform-provider-kubernetes](https://github.com/hashicorp/terraform-provider-kubernetes/issues/1775)

<br>

# Aplicação de Testes

Agora que temos todos os recursos do cluster minimamente provisionados, vamos testar o funcionamento do Karpenter. Vamos fazer deploy de uma aplicação de exemplo para ver se os nodes vão ser provisionados para suprir o novo capacity solicitado.

```bash
❯ kubectl apply -f files/deploy/demo/chip.yaml
namespace/chip created
deployment.apps/chip created
service/chip created
horizontalpodautoscaler.autoscaling/chip created
```


No caso foi provisionado para suprir os 2 novos pods solicitados para a aplicação de exemplo. Agora vamos executar os cenários de scale in e out para ver como o ambiente se comporta.

![Image](https://cdn-images-1.medium.com/max/1024/1*DOlh-cIezLOTNGpjO1GWOQ.png)

![Image](https://cdn-images-1.medium.com/max/1024/1*ylV5ifomSJw1UHOvIk0bQg.png)

<br>

### Cenário 1 — Scale In

Vamos exemplificar o cenário onde temos 4 nodes iniciais no cluster, e vamos fazer o scale de um deployment de 2 replicas para 100 de forma brusca para ver como o Karpenter vai lidar com essa mudança de capacity solicitado.

```bash
kubectl scale --replicas 100 deployment/chip -n chip
```

![Image](https://cdn-images-1.medium.com/max/800/1*wYPdjUBQZPWPQPmCmiUNGw.png)

**Replicas iniciais do deployment:** 4
**Replicas desejadas do deployment:** 100
**CPU Requests:** 250m
**RAM Requests:** 512m
**Quantidade de Nodes Iniciais:** 4
**Quantidade de Nodes final:** 25
**Horário do Apply:** 17:10:35
**Horário do scale finalizado:** 17:13:50
**Tempo Total:** 00:03:25

![Image](https://cdn-images-1.medium.com/proxy/1*27pFs8GxbM1F4FLA6aTlEg.png)

Conseguimos provisionar um capacity para suprir uma demanda brusca de 4 para 100 unidades computacionais que necessitavam de nodes em 3 minutos.

<br>

### Cenário 2 — Scale Out

Agora vamos testar o cenário inverso, onde vamos fazer o scale out do ambiente de forma brusca para avaliar como karpenter vai lidar com esse capacity fora de uso.

![Image](https://cdn-images-1.medium.com/max/800/1*ClVeK_eB__7F8osL1kYmRg.png)

```bash
kubectl scale --replicas 4 deployment/chip -n chip
```

**Replicas iniciais do deployment:** 100
**Replicas desejadas do deployment:** 4
**CPU Requests:** 250m
**RAM Requests:** 512m
**Quantidade de Nodes Iniciais:** 25
**Quantidade de Nodes final:** 4
**Horário do Apply:** 17:18:55
**Horário do scale finalizado:** 17:19:50
**Tempo Total:** 00:00:55

Para o scale out de nodes em desuso foi ainda melhor que scale in, fazendo um desligamento em massa de 25 nodes para 4 em 55 segundos.

**Lembrando que toda a PoC foi disponibilizada no [Github](https://github.com/msfidelis/eks-karpenter-autonomous-cluster).**

<br>

#### Obrigado aos Revisores:

- **Rafael Silva** — [@rafaotetra](https://mobile.twitter.com/rafaotetra)
- **Gabriel Machado** — [@gmsantos_](https://twitter.com/gmsantos__)
- **Somatorio **— @somatorio


<br>

#### Referencias:

- **Karpenter — Getting Started with Terraform **— [https://karpenter.sh/v0.5.3/getting-started-with-terraform/](https://karpenter.sh/v0.5.3/getting-started-with-terraform/)
- **Karpenter Best Pratices** — [https://aws.github.io/aws-eks-best-practices/karpenter/](https://aws.github.io/aws-eks-best-practices/karpenter/)
- **Karpenter — Topology Spreads** — [https://karpenter.sh/v0.13.2/tasks/scheduling/#topology-spread](https://karpenter.sh/v0.13.2/tasks/scheduling/#topology-spread)
- **Deploy CoreDNS on Amazon EKS with Fargate automatically using Terraform and Python** — [https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/deploy-coredns-on-amazon-eks-with-fargate-automatically-using-terraform-and-python.html](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/deploy-coredns-on-amazon-eks-with-fargate-automatically-using-terraform-and-python.html)

<br>

Me [sigam no Twitter](https://twitter.com/fidelissauro) para acompanhar as paradinhas que eu compartilho por lá!

Te ajudei de alguma forma? Me pague um café (_mentira, todas as doações são convertidas para abrigos de animais da minha cidade_)

**Chave Pix:** fe60fe92-ecba-4165-be5a-3dccf8a06bfc

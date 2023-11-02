---
layout: post
image: https://cdn-images-1.medium.com/max/1024/0*DCHMG6rWlh39XAZe.png
title: Karpenter — Estratégias para resiliência no uso de Spot Instances em produção
canonical_url: https://medium.com/@fidelissauro/karpenter-estrat%C3%A9gias-para-resili%C3%AAncia-no-uso-de-spot-instances-em-produ%C3%A7%C3%A3o-398c7bff2cdc?source=rss-fc2fda5e9bc2------2
author: matheus
featured: true
categories: [ aws, arquitetura, kubernetes, terraform, karpenter ]
---
# Introdução

Esse é o segundo artigo que eu publico sobre Karpenter. Dessa vez decidi trazer um ponto de vista bem legal que é a adoção de uso de Spots em produção.

Utilizar spots é uma estratégia muito comum pra quem deseja algum saving na conta da AWS no fim do mês, podem ser utilizada em formas de EC2 diretamente, Containers, Workloads de data e etc.

As instâncias spots nos permitem utilizar capacity ocioso do EC2 na AWS, gerando um saving de até 90% no custo das instâncias comparados aos preços On Demand. Porém a AWS não da uma garantia de que sua instância irá durar para sempre, podendo ser retirada do seu workload a qualquer momento. Por essa questão, o produto é desenhado pra aplicações que rodem no modelo mais stateless possível.

É uma boa pratica ver ambientes de desenvolvimento e teste rodando 100% em spots para diminuir custo, mas ainda existe um certo "receio" em ver ambientes produtivos utilizando toda, ou parte, da sua carga de trabalho em spots. Mas é possível, se utilizarmos de algumas estratégias para isso.

A ideia desse artigo é demonstrar possibilidades do uso do **Karpenter** para ganhar um pouco mais de resiliência em produção em ambientes que rodam totalmente, ou parcialmente com Spots.

Caso você não tenha visto ainda, fiz um artigo sobre uma PoC onde descrevo **como criar um ambiente em Amazon EKS sem Node Groups, utilizando somente o Karpenter pra suprir o capacity computacional**.

[ARTIGO - Provisionando um cluster de EKS sem Node Groups com Karpenter](https://medium.com/@fidelissauro/provisionando-um-cluster-de-eks-sem-node-groups-com-karpenter-4d302b32b620)

Caso você não tenha visto ainda, te convido para ler um artigo que eu escrevi sobre como utilizar o **Istio para sobreviver a cenários de caos**. Não tem nada a ver com o tema, mas eu acho que você vai gostar. #Confia.

[ARTIGO - Sobrevivendo a cenários de caos no Kubernetes com Istio e Amazon EKS](https://medium.com/@fidelissauro/sobrevivendo-a-cen%C3%A1rios-de-caos-no-kubernetes-com-istio-e-amazon-eks-4fb8469a73da)

Todos os exemplos aqui do texto estão feitos de forma resumida, porém você pode encontrá-los de forma completa [neste repositório do Github](https://github.com/msfidelis/eks-karpenter-autonomous-cluster/tree/main/examples/spots)

[REPOSITÓRIO - eks-karpenter-autonomous-cluster/examples/spots at main · msfidelis/eks-karpenter-autonomous-cluster](https://github.com/msfidelis/eks-karpenter-autonomous-cluster/tree/main/examples/spots)

<br>

## Cenário Inicial

Nesse artigo iremos abordar as estratégias:

- Multi-AZ
- Diversificação de Instâncias
- Diversificação entre capacity Spots x On Demand

Todos os cenários vão seguir a mesma formula, vamos escalar todos os pods de 2 para 100 e ver como o provisionamento vai se comportar.

<br>

## Multi-AZ

Inicialmente, vamos fazer o básico em relação a ambientes produtivos, sendo ele rodando em spots ou não. Rodar em Multi AZ é o arroz com feijão quando falamos sobre cloud pública no geral. E quando falamos em ambientes 100% spots, onde vamos executar esse primeiro cenário, é praticamente impossível ganhar qualquer tipo de estabilidade sem rodarmos Multi AZ.

Vamos adicionar uma especificação sobre a label **_topology.kubernetes.io/zone_** tendo todas as AZ's que sua aplicação deverá utilizar

{% gist a7d33da2fbeb0f10097d47870dec611e %}


Agora vamos realizar uma modificação no nosso deployment utilizando os topology spreads e skews. O controlador do Karpenter vai se basear nessa informação pra realizar o provisionamento dos nodes quando precisar suprir um capacity.

{% gist 025b5c652f656495532e6fb1db78fd8c %}

![Imagem](https://cdn-images-1.medium.com/max/1024/1*mceKb3IHQdpQpQSOVCpZOw.png)

<br>

### Diversificação de Máquinas

Uma das estratégias mais efetivas pra se proteger contra compras bruscas de tipos de instancias especificas de spots é a diversificação.

Isso significa subir mais de um tipo de familia e tamanho no workload. Assim, se subirmos um pool de **_c5.large_**, **_m5.large_** e **_r5.large_**, caso exista uma compra massiva de algum desses tamanhos, podemos proteger de forma segura a disponibilidade de nossas aplicações se elas forem distribuídas de forma inteligente entre os nodes.

Primeiramente vamos adicionar/alterar no Provisioner a spec baseada na label **_node.kubernetes.io/instance-type_** dos nodes, e nela vamos adicionar uma lista contendo os tipos de familia que podem ser lançadas para suprir capacity.

{% gist 81578a1fa116d0da4abccbb8b60dbf8a %}

Vamos editar o deployment e adicionar o topology spread baseado na label **_node.kubernetes.io/instance-type_** também. Dessa forma vamos direcionar uma distribuição do nosso deployment entre os tipos de instancia, assim como fizemos com as AZ's.

{% gist 6666571baf33473e1378068da17560de %}


Vamos fazer o scale do deployment de 2 para 100 pra ver como a distribuição irá ocorrer.

```bash
kubectl scale --replicas 100 deploy/chip -n chip
````


![Imagem](https://cdn-images-1.medium.com/max/1024/1*DJiFbIUwauVltAm1N4yJvg.png)
![Imagem](https://cdn-images-1.medium.com/max/1024/1*MBe1TfXr-4Hqpgl2IOAM0A.png)

Dessa forma, conseguimos gerar uma distribuição bem tranquila entre os tamanhos de nodes do cluster pra suprir o novo capacity solicitado conforme o esperado.

<br>

### Diversificação On Demand x Spots

Uma estratégia mais conservadora e segura de se usar spots em produção baseia-se em fazer uma diversificação entre instancias Spots e On Demand. Mantendo uma porcentagem do workload em extrema segurança. Nesse sentido, o **Karpenter** também nos permite selecionar mais de um tipo de Capacity Type na label **_karpenter.sh/capacity-type_**.

{% gist b88a185526a58fdaa8891c3e41c698ec %}


Agora vamos ajustar o **_Spread Constraint_** também como fizemos nos exemplos anteriores para distribuir os pods entre os tipos de nodes (já que agora temos não só o uso de spots, mas também nodes on-demand) assim como fizemos com as AZ’s e os tipos de instâncias.

{% gist 5134f9e64efa4e6bc9fc2b0a17bf8ece %}

Dessa forma também conseguimos instruir o Karpenter pra subir de forma diversificada a quantidade de Spots vs On Demand.

![Imagem](https://cdn-images-1.medium.com/max/1024/1*7vj9ZVHGhM0rtcLmBsdQ0w.png)

<br>

### Node Termination Handler

*Update 20/08/2023* — Depois de trocar bastante ideia com a galera, decidi editar esse artigo para adicionar o Node Termination Handler na nossa estratégia.

O **Node Termination Handler** é uma forma interessante de fazer Drain dos nossos nodes com base em notificações de Spot Interruptions, Rebalance Recommendations do Autoscale Group ou de um desligamento padrão das EC2. Esses eventos podem ser muito comuns quando tratamos de ambientes voláteis que utilizam estratégias de Spots.

![Imagem](https://cdn-images-1.medium.com/max/995/0*ZgrXumd_2ja6-8QS.png)

Não vou abordar muitos detalhes do provisionamento, porém vou deixar um [exemplo completo no Github](https://github.com/msfidelis/eks-karpenter-autonomous-cluster).

Mas basicamente, precisamos provisionar o chart do **aws-node-termination-handler**, informando uma URL de um SQS e habilitando o **enableSqsTerminationDraining**. Questões como IAM estão detalhadas no repositório.

{% gist f98f1b1373b23df81bc366f1a84a4551 %}

Precisamos provisionar uma série de Event Rules recomendadas na documentação do projeto e enviá-las para o SQS informado no chart pela **queueURL**.

{% gist a928496d90f36656ad2efe49a121db06 %}

Sempre que um evento de desligamento de Spot for informado, ou solicitado via console, cli, api, um evento será enviado para essa fila SQS, consumido pelo **aws-node-termination-handler** que se encarregará de fazer um drain dos pods a tempo suficiente para realocá-los em outros nodes.

![Imagem](https://cdn-images-1.medium.com/max/865/1*2pvckY_9zzQ61t_yavLf1w.png)

<br>

### Referências / Material de Apoio 
- **EKS Best Pratices** [https://aws.github.io/aws-eks-best-practices/karpenter/](https://aws.github.io/aws-eks-best-practices/karpenter/)
- **Pod Topology Spread Constraints** [https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/](https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/)
- **Karpenter Provisioner API** [https://karpenter.sh/v0.5.6/provisioner/](https://karpenter.sh/v0.5.6/provisioner/)
- **Karpenter Topology Spread** [https://karpenter.sh/v0.13.2/tasks/scheduling/#topology-spread](https://karpenter.sh/v0.13.2/tasks/scheduling/#topology-spread)
- **EC2 Spot Best Pratices** [https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-best-practices.html](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-best-practices.html)
- **EC2 Spots** [https://aws.amazon.com/pt/ec2/spot/](https://aws.amazon.com/pt/ec2/spot/)
- **Node Termination Handler** [https://github.com/aws/aws-node-termination-handler](https://github.com/aws/aws-node-termination-handler)

**Obrigado aos revisores:**
- [@Daniel_Requena](https://twitter.com/Daniel_Requena)
- [Marcos Magalhães](https://medium.com/u/8b5b07c80a30) ([@mmagalha](https://twitter.com/mmagalha))
- [Rafael Gomes](https://medium.com/u/74d7a70cb8c2) ([@gomex](https://twitter.com/gomex))
- [@indiepagodeiro](https://twitter.com/indiepagodeiro)
- [Edson Celio](https://medium.com/u/9a03713671e5) (@tuxpilgrim)

Me [sigam no Twitter](https://twitter.com/fidelissauro) para acompanhar as paradinhas que eu compartilho por lá!

Te ajudei de alguma forma? Me pague um café (Mentira, todos os valores doados nessa chave são dobrados por mim e destinados a ongs de apoio e resgate animal)

**Chave Pix:** fe60fe92-ecba-4165-be5a-3dccf8a06bfc 

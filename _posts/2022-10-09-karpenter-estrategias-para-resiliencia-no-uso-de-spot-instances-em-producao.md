---
layout: post
# image: https://cdn-images-1.medium.com/max/1024/0*DCHMG6rWlh39XAZe.png
image: assets/images/capa-spot.png
title: Karpenter — Estratégias para resiliência no uso de Spot Instances em produção
canonical_url: https://medium.com/@fidelissauro/karpenter-estrat%C3%A9gias-para-resili%C3%AAncia-no-uso-de-spot-instances-em-produ%C3%A7%C3%A3o-398c7bff2cdc?source=rss-fc2fda5e9bc2------2
author: matheus
featured: true
categories: [ aws, arquitetura, kubernetes, terraform, karpenter ]
---

**Update 17/11/2023** - *Alguns manifestos mudam sua estrutura a partir da versão 0.32.x do Karpenter. Nessa data de hoje aproveitei para atualizar os exemplos para os schemas mais novos. [Confira o blogpost do Edson sobre o tema](https://blog.edsoncelio.dev/o-que-muda-no-karpenter-a-partir-das-versoes-032x).*

Esse é o segundo artigo que eu publico sobre Karpenter. Dessa vez decidi trazer um ponto de vista bem legal que é a adoção de uso de Spots em produção.

Utilizar spots é uma estratégia muito comum pra quem deseja algum saving na conta da AWS no fim do mês, podem ser utilizada em formas de EC2 diretamente, Containers, Workloads de data e etc.

As instâncias spots nos permitem utilizar capacity ocioso do EC2 na AWS, gerando um saving de até 90% no custo das instâncias comparados aos preços On Demand. Porém a AWS não da uma garantia de que sua instância irá durar para sempre, podendo ser retirada do seu workload a qualquer momento. Por essa questão, o produto é desenhado pra aplicações que rodem no modelo mais stateless possível.

É uma boa pratica ver ambientes de desenvolvimento e teste rodando 100% em spots para diminuir custo, mas ainda existe um certo "receio" em ver ambientes produtivos utilizando toda, ou parte, da sua carga de trabalho em spots. Mas é possível, se utilizarmos de algumas estratégias para isso.

A ideia desse artigo é demonstrar possibilidades do uso do **Karpenter** para ganhar um pouco mais de resiliência em produção em ambientes que rodam totalmente, ou parcialmente com Spots.

Caso você não tenha visto ainda, fiz um artigo sobre uma PoC onde descrevo **como criar um ambiente em Amazon EKS sem Node Groups, utilizando somente o Karpenter pra suprir o capacity computacional**.


{% linkpreview "https://medium.com/@fidelissauro/provisionando-um-cluster-de-eks-sem-node-groups-com-karpenter-4d302b32b620" %}

Caso você não tenha visto ainda, te convido para ler um artigo que eu escrevi sobre como utilizar o **Istio para sobreviver a cenários de caos**. Não tem nada a ver com o tema, mas eu acho que você vai gostar. #Confia.

{% linkpreview "https://medium.com/@fidelissauro/sobrevivendo-a-cen%C3%A1rios-de-caos-no-kubernetes-com-istio-e-amazon-eks-4fb8469a73da" %}

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

{% gist 1e95b30d8c727b0a313d9d6f4f4b9d8a %}


Agora vamos realizar uma modificação no nosso deployment utilizando os topology spreads e skews. O controlador do Karpenter vai se basear nessa informação pra realizar o provisionamento dos nodes quando precisar suprir um capacity.

{% gist 025b5c652f656495532e6fb1db78fd8c %}

![Imagem](https://cdn-images-1.medium.com/max/1024/1*mceKb3IHQdpQpQSOVCpZOw.png)

<br>

### Diversificação de Máquinas

Uma das estratégias mais efetivas pra se proteger contra compras bruscas de tipos de instancias especificas de spots é a diversificação.

Isso significa subir mais de um tipo de familia e tamanho no workload. Assim, se subirmos um pool de **_c5.large_**, **_m5.large_** e **_r5.large_**, caso exista uma compra massiva de algum desses tamanhos, podemos proteger de forma segura a disponibilidade de nossas aplicações se elas forem distribuídas de forma inteligente entre os nodes.

Primeiramente vamos adicionar/alterar no NodePool a spec baseada na label **_node.kubernetes.io/instance-type_** dos nodes, e nela vamos adicionar uma lista contendo os tipos de familia que podem ser lançadas para suprir capacity.

{% gist 26696e26cbb940fc7f714fec6dbd2c91 %}

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

{% gist db03f5dafe0dbfaefb41e8b28e28fcb0 %}


Agora vamos ajustar o **_Spread Constraint_** também como fizemos nos exemplos anteriores para distribuir os pods entre os tipos de nodes (já que agora temos não só o uso de spots, mas também nodes on-demand) assim como fizemos com as AZ’s e os tipos de instâncias.

{% gist 5134f9e64efa4e6bc9fc2b0a17bf8ece %}

Dessa forma também conseguimos instruir o Karpenter pra subir de forma diversificada a quantidade de Spots vs On Demand.

![Imagem](https://cdn-images-1.medium.com/max/1024/1*7vj9ZVHGhM0rtcLmBsdQ0w.png)

<br>

### Node Termination Handler - **DEPRECATED** 

O **Node Termination Handler** é uma forma interessante de fazer Drain dos nossos nodes com base em notificações de Spot Interruptions, Rebalance Recommendations do Autoscale Group ou de um desligamento padrão das EC2. Esses eventos podem ser muito comuns quando tratamos de ambientes voláteis que utilizam estratégias de Spots.

![Imagem](https://cdn-images-1.medium.com/max/995/0*ZgrXumd_2ja6-8QS.png)

*Update 17/11/2023* - Segundo a comunidade do Karpenter, não é mais recomendado o uso do Node Termination handler pois o proprio componente agora faz Interruption Handling. - [Link](https://karpenter.sh/docs/faq/#should-i-use-karpenter-interruption-handling-alongside-node-termination-handler)

A Referencia continuará no post mas os detalhes de implementação serão removidos. Para consulta de referencia, os detalhes de implementação estão [neste link](https://github.com/msfidelis/eks-karpenter-autonomous-cluster/blob/note-termination-handler/helm_aws_node_termination_handler.tf)

No proximo topico abordaremos o *Interruption Handler nativo do Karpenter*.


<!-- O **Node Termination Handler** é uma forma interessante de fazer Drain dos nossos nodes com base em notificações de Spot Interruptions, Rebalance Recommendations do Autoscale Group ou de um desligamento padrão das EC2. Esses eventos podem ser muito comuns quando tratamos de ambientes voláteis que utilizam estratégias de Spots.

![Imagem](https://cdn-images-1.medium.com/max/995/0*ZgrXumd_2ja6-8QS.png)

Não vou abordar muitos detalhes do provisionamento, porém vou deixar um [exemplo completo no Github](https://github.com/msfidelis/eks-karpenter-autonomous-cluster).

Mas basicamente, precisamos provisionar o chart do **aws-node-termination-handler**, informando uma URL de um SQS e habilitando o **enableSqsTerminationDraining**. Questões como IAM estão detalhadas no repositório.

{% gist f98f1b1373b23df81bc366f1a84a4551 %}

Precisamos provisionar uma série de Event Rules recomendadas na documentação do projeto e enviá-las para o SQS informado no chart pela **queueURL**.

{% gist a928496d90f36656ad2efe49a121db06 %}

Sempre que um evento de desligamento de Spot for informado, ou solicitado via console, cli, api, um evento será enviado para essa fila SQS, consumido pelo **aws-node-termination-handler** que se encarregará de fazer um drain dos pods a tempo suficiente para realocá-los em outros nodes.

![Imagem](https://cdn-images-1.medium.com/max/865/1*2pvckY_9zzQ61t_yavLf1w.png)

<br> -->



### Karpenter - Interruption Handling

*Update 17/11/2023* - Como mencionado no topico anterior, agora o Karpenter possui a feature de realizar handling dos nodes que mudam de estado. 


Para fazer o provisionamento temos que criar a fila SQS da mesma forma como 

{% gist a928496d90f36656ad2efe49a121db06 %} 

Para hablitar o Interruption Handling nativo do Karpenter, basta informar o nome da queue na instalação do helm 


```hcl
resource "aws_sqs_queue" "node_termination_handler" {
  name                       = format("%s-aws-node-termination-handler", var.cluster_name)
  delay_seconds              = 0
  max_message_size           = 2048
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 10
  visibility_timeout_seconds = 60
}
```


```hcl
resource "helm_release" "karpenter" {
    namespace        = "karpenter"
    create_namespace = true

    name       = "karpenter"
    repository = "https://charts.karpenter.sh"
    chart      = "karpenter"


    set {
        name  = "clusterName"
        value = var.cluster_name
    }

    set {
        name  = "clusterEndpoint"
        value = aws_eks_cluster.eks_cluster.endpoint
    }

    set {
        name = "settings.interruptionQueue"
        value = aws_sqs_queue.node_termination_handler.name
    }

}
```

<br>

### Referências / Material de Apoio 
- **EKS Best Pratices** [https://aws.github.io/aws-eks-best-practices/karpenter/](https://aws.github.io/aws-eks-best-practices/karpenter/)
- **Pod Topology Spread Constraints** [https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/](https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/)
- **Karpenter Provisioner API** [https://karpenter.sh/v0.5.6/provisioner/](https://karpenter.sh/v0.5.6/provisioner/)
- **Karpenter Topology Spread** [https://karpenter.sh/v0.13.2/tasks/scheduling/#topology-spread](https://karpenter.sh/v0.13.2/tasks/scheduling/#topology-spread)
- **EC2 Spot Best Pratices** [https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-best-practices.html](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-best-practices.html)
- **EC2 Spots** [https://aws.amazon.com/pt/ec2/spot/](https://aws.amazon.com/pt/ec2/spot/)
- **Node Termination Handler** [https://github.com/aws/aws-node-termination-handler](https://github.com/aws/aws-node-termination-handler)
- **Interruption Handling** [https://karpenter.sh/docs/faq/#should-i-use-karpenter-interruption-handling-alongside-node-termination-handler](https://karpenter.sh/docs/faq/#should-i-use-karpenter-interruption-handling-alongside-node-termination-handler)
- **O que muda no Karpenter a partir das versões 0.32.x?** [https://blog.edsoncelio.dev/o-que-muda-no-karpenter-a-partir-das-versoes-032x](https://blog.edsoncelio.dev/o-que-muda-no-karpenter-a-partir-das-versoes-032x)

**Obrigado aos revisores:**
- [@Daniel_Requena](https://twitter.com/Daniel_Requena)
- [Marcos Magalhães](https://medium.com/u/8b5b07c80a30) ([@mmagalha](https://twitter.com/mmagalha))
- [Rafael Gomes](https://medium.com/u/74d7a70cb8c2) ([@gomex](https://twitter.com/gomex))
- [@indiepagodeiro](https://twitter.com/indiepagodeiro)
- [Edson Celio](https://medium.com/u/9a03713671e5) (@tuxpilgrim)

Me [sigam no Twitter](https://twitter.com/fidelissauro) para acompanhar as paradinhas que eu compartilho por lá!

Te ajudei de alguma forma? Me pague um café (Mentira, todos os valores doados nessa chave são dobrados por mim e destinados a ongs de apoio e resgate animal)

**Chave Pix:** fe60fe92-ecba-4165-be5a-3dccf8a06bfc 

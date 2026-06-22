---
layout: post
image: assets/images/staff/capa-ockham.png
author: matheus
featured: false
published: true
categories: [ staff-plus, carreira ]
title: Staff Framework - A Navalha de Ockham e Problemas Complexos
---

Em engenharia de software, existe uma tendência natural de associar senioridade à capacidade de lidar com problemas complexos. E que de fato, não é uma mentira em linhas gerais. Quanto maior o nível de atuação, maior costuma ser o escopo dos problemas, o número de sistemas envolvidos, a quantidade de pessoas impactadas e o custo das decisões tomadas. Dentro das cadeiras do público Staff, essa complexidade deixa de estar concentrada apenas em uma parte do sistema ou no código em si, e passa a envolver arquitetura, como operar, impacto em produto, organização, handoff das soluções, comunicação com demais áreas envolvidas e estratégia. 

Entretanto, lidar com problemas complexos não necessariamente significa produzir soluções igualmente complexas. Muitas vezes, lidando com variáveis de tempo, orçamento, maturidade de time e impacto pro negócio, o maior sinal de maturidade técnica vai estar em compreender suficientemente bem o problema para remover tudo que não é necessário e produzir uma solução simples, direta e com muito impacto, e é exatamente nesse ponto que a **Navalha de Ockham** pode ser utilizada como uma ferramenta de trabalho.

<br>

## A Navalha de Ockham

A Navalha de Ockham recebe esse nome por sua associação com Guilherme de Ockham, filósofo e teólogo inglês do século XIV. Ockham atuou em um contexto no qual filosofia, lógica e teologia buscavam explicar a realidade por meio de sistemas conceituais extremamente elaborados. Sua contribuição intelectual foi defender uma postura de maior simplicidade, onde não deveríamos introduzir variáveis, causas ou pressupostos além daqueles realmente necessários para explicar um fenômeno.

Fui apresentado a esse termo durante uma entrevista de um profissional de ciencia de dados que a explicou pra mim como método de pensamento cujo qual utilizava para elaborar hipóteses. Achei impressionante e não demorou muito pra que eu fosse atrás do termo para entender melhor. A Navalha de Ockham é frequentemente resumida pela ideia de que *"a explicação mais simples costuma ser a correta"*. Essa interpretação, embora popular e bem forte aos ouvidos (no caso olhos, nesse artigo), é incompleta quando falamos de engenharia e arquitetura de software.

O princípio não afirma que a explicação mais simples será sempre verdadeira, nem que toda solução deve possuir o menor número possível de componentes. O que a navalha propõe, para nós, é que não devemos multiplicar componentes, hipóteses ou suposições sobre algo sem necessidade. Na prática, quando duas explicações conseguem acomodar as mesmas evidências, devemos começar por aquela que depende do menor número de premissas e detalhes adicionais. Quando duas soluções atendem aos mesmos requisitos, devemos questionar se a mais complexa realmente entrega algum benefício proporcional ao custo que está introduzindo.

No dia a dia na cadeira, ela pode ser utilizada como um método de raciocínio base para investigar incidentes, decompor problemas, avaliar arquiteturas, escrever propostas técnicas e tomar decisões sob incerteza. Começar pelo mais simples. Levar pra liderança e pros times as alternativas mais diretas e simples. 

<br>

## Simplicidade como Disciplina

Como veremos em demais capítulos, problemas de engenharia raramente chegam de forma "limpa" ou "clara". Na maioria das vezes, eles vem como uma mistura de sintomas, interpretações, ruídos e hipóteses. Isso quando não chegam com uma série de soluções previamente imaginadas. Frases como "o sistema não escala", "o banco de dados está lento", "precisamos quebrar o monólito", "precisamos adotar eventos" ou "essa aplicação precisa ser modernizada" não representam necessariamente problemas bem formulados. Elas representam percepções sobre o problema e, em alguns casos, já carregam uma solução embutida.

Quando alguém afirma que um sistema precisa ser quebrado em microserviços, por exemplo, é importante separar duas coisas: "qual é o problema observado" e "por que a decomposição em microserviços seria a melhor resposta para esse problema?". 

Pode ser que o sistema realmente tenha atingido um limite estrutural, pode ser que a convivência entre multiplos engenheiros, demandas e projetos na mesma codebase pode ser a causa de uma série de intercorrências, complexidades e incidentes pela alta complexidade de testes e validações. Validações sujas quando cruzadas com multiplos comportamentos novos. Também pode ser que o problema esteja em uma consulta ineficiente, em um modelo de dados inadequado, em uma dependência externa, em uma ausência de isolamento ou em um processo de deployment. Antes de discutir a solução, precisamos melhorar a formulação do problema.

A Navalha de Ockham pode ser aplicada justamente nesse primeiro movimento. O objetivo é remover do problema tudo aquilo que ainda não foi demonstrado. Precisamos separar aquilo que sabemos daquilo que estamos supondo. Quando dizemos que "o sistema não escala", o que exatamente estamos observando? A latência aumentou? A taxa de erros cresceu? O banco de dados atingiu o limite de conexões? O consumo de CPU está saturado? Existe contenção em alguma dependência específica? O problema ocorre em todos os fluxos ou apenas em uma operação? São perguntas que nos ajudam a observar e isolar para uma proposta mais madura. 

Se isolarmos de forma lúdica para algo 

> O tempo de resposta do endpoint de confirmação ultrapassa dois segundos quando a aplicação recebe mais de 1.500 requisições por segundo, devido à contenção de escrita em uma única partição do banco de dados.

Essa formulação reduz o espaço do problema. Ela não resolve o problema automaticamente, mas impede que iniciemos a discussão com soluções desconectadas das evidências. A simplicidade, nesse contexto, não significa ignorar detalhes ou otimizações que de fato, poderiam gerar algum tipo de benefício. Significa organizar os detalhes de forma que possamos distinguir aquilo que é essencial daquilo que apenas está gerando ruído pro processo. Tudo que invariavelmente poderia ser sugerido, como "quebrar em microserviços", levaria a algum nível de otimização sim, e poderia de fato resolver o problema. Mas com uma solução, talvez, não tão simples para a resolução. 

<br>

## Simplificar sem ser Simplista

Existe uma diferença importante entre simplificar um problema e tratá-lo de forma simplista. De nenhuma forma, deverá ser a conclusão que você deverá sair ao terminar de ler este texto, por favor... A navalha é uma ferramenta para organizar pensamento para subir propostas para liderança, e voltar pra engenharia de forma profissional. 

O termo "simplificar" deve ser tratado como uma forma de reduzir a quantidade de elementos sem remover aquilo que é necessário para compreender o comportamento do sistema. É uma tentativa de encontrar uma representação menor, porém ainda fiel à realidade. Ser "simplista" significa ignorar restrições, exceções, riscos ou efeitos sistêmicos para tornar a explicação mais conveniente a um tipo de visão. 

Um sistema distribuído, por exemplo, está sujeito a falhas, delays em comunicação entre componentes de rede, duplicação de mensagens, reordenação de eventos, problemas de concorrência e indisponibilidade de dependências. Uma explicação que desconsidera esses fatores pode parecer simples, mas não representa adequadamente o sistema, tornando a mesma "simplista". 

Na rotina de profissionais com papeis de staff, em muitos momentos, a organização irá procurar alguém experiente para simplificar uma discussão. Essa simplificação não pode acontecer por meio da remoção arbitrária dos elementos difíceis do problema ou na compilação de propostas e hipóteses.

<br>

## A Navalha de Ockham e Investigação de Incidentes

Uma das janelas mais óbvias para se aplicar o conceito da Navalha de Ockham é claramente durante incidentes sistêmicos. Durante um downtime, uma organização trabalha sob pressão e normalmente existem muitas pessoas envolvidas no processo, com muitas opiniões e muitas hipóteses do que poderia estar acontecendo ao mesmo tempo. 

A Navalha de Ockham nos orienta a começar pelas explicações que exigem menos suposições e que conseguem explicar a maior quantidade de sinais observados. Eu gosto muito da estratégia de "tirar todo mundo do prédio pegando fogo para depois apagar o incêndio", indo para uma estratégia mais fácil para reduzir o impacto do incidente para o cliente, independente da causa. Se a latência começou a aumentar imediatamente após um deployment, está concentrada apenas nas instâncias que receberam a nova versão e desaparece quando realizamos o rollback, a mudança recente é uma hipótese forte. Investigar primeiro uma falha global de rede exigiria introduzir mais suposições para explicar as mesmas evidências. Isso não significa declarar imediatamente que o deployment é a causa. Significa apenas priorizar a hipótese com maior poder explicativo e menor custo de suposição.

Em incidentes, a navalha pode ajudar a ordenar a investigação. Podemos começar perguntando: o que mudou, quando o comportamento começou, quais componentes estão afetados, quais continuam saudáveis e qual é a primeira divergência observável entre eles? Esse simples modelo mental não é uma bala de prata imediata, mas reduz muito o espaço das investigações para as hipóteses mais obvias. 
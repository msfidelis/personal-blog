---
layout: post
image: assets/images/staff/capa-ockham.png
author: matheus
featured: false
published: true
categories: [ staff-plus, carreira ]
title: Staff Framework - A Navalha de Ockham e Problemas Complexos
---


Em engenharia de software, existe uma tendência natural de associar senioridade à capacidade de lidar com problemas complexos. **De fato, essa associação não é equivocada em linhas gerais.** Quanto maior o nível de atuação, maior costuma ser o escopo dos problemas, o número de sistemas envolvidos, a quantidade de pessoas impactadas e o custo das decisões tomadas. **Nas posições de Staff+,** essa complexidade deixa de estar concentrada apenas em uma parte do sistema ou no código em si e passa a envolver arquitetura, operação, impacto no produto, organização, handoff das soluções, comunicação com as demais áreas envolvidas e estratégia.

Entretanto, lidar com problemas complexos não significa, necessariamente, produzir soluções igualmente complexas. Muitas vezes, **ao considerar variáveis como tempo, orçamento, maturidade do time e impacto para o negócio,** o maior sinal de maturidade técnica está em compreender suficientemente bem o problema para remover tudo o que não é necessário e produzir uma solução simples, direta e de alto impacto. **É exatamente nesse ponto que a Navalha de Ockham pode ser utilizada como ferramenta de trabalho.**


<br>

## A Navalha de Ockham

A Navalha de Ockham recebe esse nome por sua associação com Guilherme de Ockham, filósofo e teólogo inglês do século XIV. Ockham atuou em um contexto no qual **a filosofia, a lógica e a teologia buscavam explicar a realidade por meio de sistemas conceituais extremamente elaborados**. Sua contribuição intelectual foi defender uma postura de maior simplicidade, segundo a qual não deveríamos introduzir variáveis, causas ou pressupostos além daqueles realmente necessários para explicar um fenômeno.

Fui apresentado a esse termo durante a entrevista de um profissional de **ciência de dados**, que o explicou para mim como **um método de pensamento utilizado para elaborar hipóteses**. Achei o conceito impressionante, e não demorou muito para que eu pesquisasse o termo a fim de compreendê-lo melhor. A Navalha de Ockham é frequentemente resumida pela ideia de que *“a explicação mais simples costuma ser a correta”*. Essa interpretação, embora popular e bastante forte aos ouvidos (ou aos olhos, pois você está lendo), é incompleta quando falamos de engenharia e arquitetura de software.

O princípio não afirma que a explicação mais simples será sempre verdadeira, nem que toda solução deve possuir o menor número possível de componentes. **O que a navalha propõe, para nós, é que não devemos multiplicar componentes, hipóteses ou suposições sem necessidade.** Na prática, quando duas explicações conseguem acomodar as mesmas evidências, devemos começar por aquela que depende do menor número de premissas e detalhes adicionais. Quando duas soluções atendem aos mesmos requisitos, devemos questionar se a mais complexa realmente entrega algum benefício proporcional ao custo que está introduzindo.

No dia a dia da cadeira, ela pode ser utilizada como **um método-base de raciocínio para investigar incidentes, decompor problemas, avaliar arquiteturas, escrever propostas técnicas e tomar decisões sob incerteza**. Começar pelo mais simples. Levar para a liderança e para os times as alternativas mais diretas e simples.



<br>

Como veremos nos demais capítulos, **problemas de engenharia raramente chegam de forma “limpa” ou “clara”**. Na maioria das vezes, eles vêm como uma mistura de sintomas, interpretações, ruídos e hipóteses. Isso quando não chegam acompanhados de uma série de soluções previamente imaginadas. Frases como “o sistema não escala”, “o banco de dados está lento”, “precisamos quebrar o monólito”, “precisamos adotar eventos” ou “essa aplicação precisa ser modernizada” não representam, necessariamente, problemas bem formulados. **Elas representam percepções sobre o problema e, em alguns casos, já carregam uma solução embutida.**

Quando alguém afirma que um sistema precisa ser quebrado em microserviços, por exemplo, é importante separar duas questões: **“Qual é o problema observado?”** e **“Por que a decomposição em microserviços seria a melhor resposta para esse problema?”**

Pode ser que o sistema realmente tenha atingido um limite estrutural. Pode ser, também, que a convivência entre múltiplos engenheiros, demandas e projetos na mesma codebase seja a causa de uma série de intercorrências, complexidades e incidentes, devido à alta complexidade dos testes e das validações, especialmente quando alterações são cruzadas com múltiplos comportamentos novos. Também pode ser que o problema esteja em uma consulta ineficiente, em um modelo de dados inadequado, em uma dependência externa, na ausência de isolamento ou em um processo de deployment. **Antes de discutir a solução, precisamos melhorar a formulação do problema.**

A Navalha de Ockham pode ser aplicada justamente nesse primeiro movimento. **O objetivo é remover do problema tudo aquilo que ainda não foi demonstrado.** Precisamos separar aquilo que sabemos daquilo que estamos supondo. Quando dizemos que “o sistema não escala”, o que exatamente estamos observando? A latência aumentou? A taxa de erros cresceu? O banco de dados atingiu o limite de conexões? O consumo de CPU está saturado? Existe contenção em alguma dependência específica? O problema ocorre em todos os fluxos ou apenas em uma operação? **Essas perguntas nos ajudam a observar e isolar o problema para elaborar uma proposta mais madura.**

Podemos isolar o problema, de forma ilustrativa, da seguinte maneira:

> **O tempo de resposta do endpoint de confirmação ultrapassa dois segundos quando a aplicação recebe mais de 1.500 requisições por segundo, devido à contenção de escrita em uma única partição do banco de dados.**

Essa formulação reduz o espaço do problema. Ela não o resolve automaticamente, mas impede que iniciemos a discussão com soluções desconectadas das evidências. A simplicidade, nesse contexto, não significa ignorar detalhes ou otimizações que, de fato, poderiam gerar algum benefício. **Significa organizar os detalhes de modo que possamos distinguir aquilo que é essencial daquilo que apenas gera ruído no processo.** Tudo o que poderia ser sugerido de imediato, como “quebrar em microserviços”, provavelmente produziria algum nível de otimização e poderia, de fato, resolver o problema. Entretanto, isso ocorreria por meio de uma solução possivelmente desproporcional à natureza do problema observado.


<br>

## Simplificar sem ser Simplista

Existe uma diferença importante entre simplificar um problema e tratá-lo de forma simplista. **De forma alguma, essa deverá ser a conclusão com a qual você terminará a leitura deste texto.** A navalha é uma ferramenta para organizar o pensamento, estruturar propostas para a liderança e retornar à engenharia de forma profissional.

O termo “simplificar” deve ser tratado como uma forma de reduzir a quantidade de elementos sem remover aquilo que é necessário para compreender o comportamento do sistema. **É uma tentativa de encontrar uma representação menor, porém ainda fiel à realidade.** Ser “simplista” significa ignorar restrições, exceções, riscos ou efeitos sistêmicos para tornar a explicação mais conveniente a determinado ponto de vista.

Um sistema distribuído, por exemplo, está sujeito a falhas, atrasos na comunicação entre componentes de rede, duplicação de mensagens, reordenação de eventos, problemas de concorrência e indisponibilidade de dependências. Uma explicação que desconsidera esses fatores pode parecer simples, mas não representa adequadamente o sistema, **tornando-se simplista**.

Na rotina de profissionais que ocupam posições de Staff, em muitos momentos, a organização procurará alguém experiente para simplificar uma discussão. **Essa simplificação não pode acontecer por meio da remoção arbitrária dos elementos difíceis do problema, tampouco pela mera compilação de propostas e hipóteses.**


<br>

## A Navalha de Ockham e a Investigação de Incidentes

Uma das aplicações mais evidentes do conceito da Navalha de Ockham ocorre durante incidentes sistêmicos. Durante um downtime, a organização trabalha sob pressão e, normalmente, há muitas pessoas envolvidas no processo, cada uma com opiniões e hipóteses sobre o que pode estar acontecendo naquele momento.

A Navalha de Ockham nos orienta a começar pelas explicações que exigem menos suposições e conseguem explicar a maior quantidade de sinais observados. Gosto muito da estratégia de **“tirar todos do prédio em chamas antes de apagar o incêndio”**, priorizando uma ação mais simples para reduzir o impacto do incidente sobre o cliente, independentemente da causa. Se a latência começou a aumentar imediatamente após um deployment, está concentrada apenas nas instâncias que receberam a nova versão e desaparece quando realizamos o rollback, **a mudança recente se torna uma hipótese forte**. Investigar primeiro uma falha global de rede exigiria a introdução de mais suposições para explicar as mesmas evidências. Isso não significa declarar imediatamente que o deployment é a causa. **Significa apenas priorizar a hipótese com maior poder explicativo e menor custo de suposição.**

Em incidentes, a navalha pode ajudar a ordenar a investigação. Podemos começar perguntando: **o que mudou? Quando o comportamento começou? Quais componentes estão afetados? Quais continuam saudáveis? Qual é a primeira divergência observável entre eles?** Esse modelo mental simples não é uma solução imediata nem uma bala de prata, mas reduz significativamente o espaço de investigação e direciona a análise para as hipóteses mais óbvias.


<br>

## A Navalha de Ockham e as Propostas de Engenharia

A Navalha de Ockham também pode melhorar a forma como escrevemos propostas técnicas, independentemente do formato utilizado, sejam elas RFCs, ADRs, Strategy Docs ou propostas arquiteturais diversas. Não é incomum que uma proposta nasça de uma dor de negócio válida e rapidamente perca força ao tentar **“abraçar o mundo”**, passando a propor, simultaneamente, uma nova plataforma, uma mudança organizacional, uma migração tecnológica e um modelo futuro de arquitetura. **Quanto maior o escopo, mais difícil se torna avaliar se a solução realmente responde ao problema original.**

Uma boa proposta precisa começar com uma formulação clara do problema. O leitor deve conseguir entender o que está acontecendo, qual é o impacto, quais evidências sustentam a discussão e por que a situação atual é insuficiente. **Uma boa proposta deve conseguir responder a algumas perguntas básicas:** qual problema estamos resolvendo? Que resultado esperamos produzir? Por que a solução atual é insuficiente? Qual é a menor mudança capaz de atender ao objetivo? Que nova complexidade será introduzida? Como mediremos tudo isso?

A Navalha de Ockham não exige que apenas uma alternativa seja discutida. Pelo contrário, **a análise de alternativas é importante**. O que deve ser evitado é a inclusão de opções que não possuem relação real com o problema ou que existem apenas para aumentar a aparência de profundidade do documento.

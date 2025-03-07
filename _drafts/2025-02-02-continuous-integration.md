---
layout: post
image: assets/images/system-design/deploy-capa.png
featured: false
published: true
categories: [system-design, engineering, cloud]
title: System Design -  Continuous Integration
---


## Continuous Integration (Integração Contínua)

A **Integração Contínua** ou **Continuous Integration**, é a forma como as empresas que trabalham com projetos de software organizam e facilitam o trabalho em conjunto de seus desenvolvedores e demais profissionais de tecnologia. A ideia do **CI** é prover uma série de processos e ferramentas que garantam que novas modificações na *****base de código** sejam integradas de forma responsável e com a devida qualidade.

Cada vez que uma **interação na base de códigoé realizada, essa modificação deve ser automaticamente testada e verificada em diversas dimensões** . Caso esteja funcionando corretamente e atenda a todos os padrões estabelecidos, ela pode ser finalmente integrada à base oficial de código, garantindo que o que foi alterado não afete fluxos e comportamentos pré-existentes. Se essa modificação quebrar algum teste ou processo, o desenvolvedor **responsável** precisa ser notificado sobre qual comportamento foi alterado indevidamente e de que forma isso ocorreu. Para isso, existem alguns processos mais conhecidos que podemos categorizar para definirmos os conceitos.


![CI](/assets/images/system-design/ci.drawio.png)

Dentro de um fluxo de trabalho realizado por meio do Git, podemos entender, de forma simplificada e ilustrativa, que **o desenvolvedor integra uma nova feature a um sistema já existente**. Esse desenvolvedor realiza o commit de suas alterações em uma branch destinada a centralizar o trabalho nessa nova funcionalidade. **A partir dos fluxos de Continuous Integration, as automações determinam se as novas modificações estão aptas ou não a serem integradas à branch principal** do projeto e, posteriormente, direcionadas para o processo de release ou Entrega Contínua.

Fluxos de integração contínua mais modernos podem considerar a construção de artefatos sempre que branches estratégicas são modificadas. Além dos testes e validações, a aplicação construída pode ser disponibilizada em um local específico, aguardando para ser promovida à produção de forma mais fácil e ágil quando fizer sentido.


### Testes de Unidade

Os testes de unidade, ou também popularmente conhecidos como estes unitários, são responsáveis por garantir o comportamento de pequenas partes do código como funções, métodos e interfaces, inicialmente **especificando suas entradas e testando suas saídas para garantir que tudo está sendo executado como o planejado**. o executar esses testes a cada mudança, é possível identificar e corrigir problemas de forma rápida, evitando que erros simples se propaguem para áreas maiores do sistema.


### Testes de Integração

Ao contrário dos testes unitários que buscam testar componentes de forma mais isolada possível, **os testes de integração verificam como o sistema se comporta analisando componentes que interagem entre si**. Por exemplo, testar uma requisição para um endpoint e validar seu retorno, ou testar um cliente de um serviço externo, com ou sem o uso de mocks. **Esse tipo de teste é um pouco mais custoso e demorado do que os testes unitários, mas tende a fornecer respostas importantes sobre as mudanças realizadas**, garantindo que nada deixou de funcionar ou teve seu comportamento alterado de forma inesperada.


### Linters e Checagem de Sintaxe

Os **linters são ferramentas que analisam o código comparando-o com uma série de padrões predefinidos**. Ao executar esse tipo de verificação, **garantimos que a nova modificação está aderente aos padrões de qualidade e estilo de codificação acordados na empresa, no time ou em um contexto específico**. Essa estratégia busca aumentar a qualidade no ciclo de vida do produto, assegurando que todos os responsáveis pelas alterações no código sigam os mesmos padrões, mantendo-o padronizado e legível.


### Análise Estática de Código

Diferentemente dos testes que executam o código de alguma forma, as **ferramentas de análise estática examinam a base sem executá-la, com o intuito de identificar vulnerabilidades no código, problemas de desempenho, complexidade desnecessária e más práticas de implementação**. A análise estática **também pode ser estendida para a análise de dependências**, realizando as mesmas verificações em bibliotecas e módulos utilizados, a fim de identificar os mesmos problemas e vulnerabilidades. Essa prática é **altamente recomendada para evitar que versões comprometidas em termos de segurança** sejam integradas ao ambiente de produção, prevenindo riscos para o usuário final.


<br>

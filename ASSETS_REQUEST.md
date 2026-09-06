# Pedido das imagens base — avatar-corporal (MVP)

Cole este documento no gerador de imagens (GPT/DALL·E ou equivalente). São
**24 imagens**: 3 gêneros × 8 faixas de % de gordura × 1 vista (frente).

Depois de gerar, suba os arquivos em `assets/` com o nome exato da tabela e rode
`make check-assets` (validação de nome, dimensão e canal alfa).

---

## Guia de estilo (vale para TODAS as 24)

- **Manequim/silhueta cinza neutro.** Um único cinza médio (~`#9AA0A6`), com
  volume e sombreamento suave para dar forma ao corpo.
- **SEM característica de pele ou etnia.** Sem tom de pele, sem textura de pele,
  sem cabelo, **sem rosto detalhado** (cabeça lisa ou traços mínimos), sem
  genitália, sem roupa, sem tatuagem/marca.
- **Fundo 100% transparente** (PNG/WebP com canal alfa real, não branco).
- **Iluminação frontal chapada e uniforme** — sem sombra dramática, sem luz
  lateral forte. Sombras fortes fazem as faixas parecerem inconsistentes entre
  si.
- **Postura idêntica em todas**: em pé, de frente, olhando para a câmera, braços
  retos levemente afastados do corpo (~15°), palmas voltadas para frente, pés
  juntos.
- **Enquadramento IDÊNTICO e fixo** (isto é crítico — o heatmap se alinha por
  cima):
  - proporção do canvas **3:4 retrato**, **768 × 1024 px**;
  - topo da cabeça a ~3% do topo do canvas; sola dos pés a ~97%;
  - corpo centrado na vertical média;
  - **a ALTURA do corpo é a mesma em todas as 24 imagens** — só mudam largura,
    volume e contorno conforme a faixa de gordura. Ombro e quadril devem cair na
    mesma altura vertical em todas.
- **Formato de arquivo**: `.webp`, RGBA, qualidade ~90 (ou lossless).

---

## Diferença por gênero

| Gênero | Distribuição de gordura ao subir a faixa |
|---|---|
| `male` | acúmulo predominante no **abdômen e flancos** (padrão andróide); ombros largos, quadril estreito |
| `female` | acúmulo predominante em **quadril, glúteos e coxas** (padrão ginóide); cintura mais marcada nas faixas baixas |
| `neutral` | andrógino — proporção intermediária entre os dois; acúmulo distribuído entre abdômen e quadril |

---

## As 8 faixas de % de gordura

| Faixa | id (nome do arquivo) | Descrição do corpo (ajustar ao gênero) |
|---|---|---|
| < 10% | `lt10` | extremamente magro e definido; musculatura aparente, gomos abdominais nítidos, veias visíveis, quase nenhuma gordura subcutânea |
| 10–15% | `10-15` | atlético; definição muscular clara, abdômen chapado com leve marcação, contorno enxuto |
| 15–20% | `15-20` | magro saudável; corpo liso, leve indício muscular, sem gordura abdominal aparente |
| 20–25% | `20-25` | médio; sem definição muscular, contorno suave, leve acúmulo à frente do abdômen |
| 25–30% | `25-30` | sobrepeso leve; abdômen visivelmente proeminente, flancos começando a marcar, rosto/pescoço um pouco mais cheios |
| 30–35% | `30-35` | sobrepeso; abdômen arredondado e projetado, flancos e (feminino) quadril nitidamente maiores, membros mais grossos |
| 35–40% | `35-40` | obesidade grau I; grande volume abdominal, dobra na cintura, coxas encostam, contorno arredondado em todo o tronco |
| ≥ 40% | `gte40` | obesidade grau II+; volume acentuado em abdômen, quadril e coxas; pescoço curto e largo, braços volumosos |

---

## Tabela das 24 imagens

| # | Arquivo | Gênero | Faixa |
|---|---|---|---|
| 1 | `male-lt10-front.webp` | male | < 10% |
| 2 | `male-10-15-front.webp` | male | 10–15% |
| 3 | `male-15-20-front.webp` | male | 15–20% |
| 4 | `male-20-25-front.webp` | male | 20–25% |
| 5 | `male-25-30-front.webp` | male | 25–30% |
| 6 | `male-30-35-front.webp` | male | 30–35% |
| 7 | `male-35-40-front.webp` | male | 35–40% |
| 8 | `male-gte40-front.webp` | male | ≥ 40% |
| 9 | `female-lt10-front.webp` | female | < 10% |
| 10 | `female-10-15-front.webp` | female | 10–15% |
| 11 | `female-15-20-front.webp` | female | 15–20% |
| 12 | `female-20-25-front.webp` | female | 20–25% |
| 13 | `female-25-30-front.webp` | female | 25–30% |
| 14 | `female-30-35-front.webp` | female | 30–35% |
| 15 | `female-35-40-front.webp` | female | 35–40% |
| 16 | `female-gte40-front.webp` | female | ≥ 40% |
| 17 | `neutral-lt10-front.webp` | neutral | < 10% |
| 18 | `neutral-10-15-front.webp` | neutral | 10–15% |
| 19 | `neutral-15-20-front.webp` | neutral | 15–20% |
| 20 | `neutral-20-25-front.webp` | neutral | 20–25% |
| 21 | `neutral-25-30-front.webp` | neutral | 25–30% |
| 22 | `neutral-30-35-front.webp` | neutral | 30–35% |
| 23 | `neutral-35-40-front.webp` | neutral | 35–40% |
| 24 | `neutral-gte40-front.webp` | neutral | ≥ 40% |

---

## Checklist de aceite (por imagem)

- [ ] Nome do arquivo bate exatamente com a tabela
- [ ] `768 × 1024 px`, `.webp` RGBA
- [ ] Fundo transparente de verdade (não branco/cinza chapado)
- [ ] Cinza único, sem tom de pele, sem cabelo, sem rosto detalhado, sem roupa
- [ ] Mesma postura e mesmo enquadramento das demais (ombro e quadril na mesma
      altura vertical; só o volume muda)
- [ ] O volume corporal corresponde à faixa e ao padrão do gênero
- [ ] Sem sombra projetada no "chão", sem borda/moldura

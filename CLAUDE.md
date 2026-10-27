# Comparateur et simulateur de tarifs d'électricité

Front React (Vite) qui compare des offres d'électricité à partir d'une courbe de charge Enedis.
Les tarifs sont dans un seul fichier : `src/statics/price_mapping.json`.

## Mettre à jour les tarifs (procédure)

Les tarifs réglementés (TURPE, accise, TRVE) changent surtout au **1er février** et au **1er août** ;
les fournisseurs publient souvent leurs nouvelles grilles dans les semaines qui suivent. Prochaine
mise à jour attendue : **1er février 2027** (vérifier d'abord si une offre a réellement changé).

### 1. Relever les prix à la source
Utiliser le navigateur intégré (texte de la page, `get_page_text`), pas un résumé : les résumés
automatiques de pages ont déjà donné des valeurs fausses. Relever pour chaque offre : prix TTC du kWh,
abonnement mensuel TTC par puissance, **date d'application affichée**.

| Fournisseur | Offre(s) | Source |
|---|---|---|
| EDF | Bleu, Zen (Week-end, Week-end Plus, Fixe, Online, Flex), Vert, Tempo | pages `link` de chaque entrée (`particulier.edf.fr`) |
| TotalEnergies | Access (Base, HP/HC) | `totalenergies.fr/particuliers/electricite-et-gaz/grilles-tarifaires` + PDF « grille-tarifaire-access-particuliers » |
| Engie | Élec Référence 3 ans, Happy Week-end | `particuliers.engie.fr/electricite/elec-reference.html` et `happy-week-end.html` |
| Octopus | OctoEco fixe | `octopusenergy.fr/offre-electricite-tarifs` (liens vers 2 PDF « grille tarifaire » Base et HPHC) |

- Si une offre n'est plus listée (ex. TotalEnergies : Heures Éco/Vertes, Engie : Référence 2 ans),
  **ne pas décider seul** : proposer renommer / remplacer / retirer à l'utilisateur.
- **Ne jamais télécharger un fichier sans l'accord explicite de l'utilisateur.** Pour un PDF : demander
  la permission, puis lire en mémoire ou extraire le texte (`pdftotext -layout`, ou PyMuPDF avec les
  coordonnées si les tableaux sont mélangés), puis supprimer le fichier. `WebFetch` ne sait pas lire
  ces PDF et en **enregistre une copie sur disque**.
- Les pages contiennent des coquilles (ex. un TTC inférieur au HT) : croiser avec le PDF ou avec
  HT × 1,2 + taxes avant de recopier une valeur douteuse, et la signaler.

### 2. Unités du fichier
- Prix du kWh : **€ × 10 000** (0,2001 € → `2001`).
- Abonnement mensuel : **€ × 100** (12,13 € → `1213`). Si le site donne un montant annuel : ÷ 12.
- Toujours en **TTC**. `lastUpdate` = date d'application affichée (sinon date de relevé, à dire dans `comments`).

### 3. Schéma d'une entrée
Clé de recherche : `provider` + `offerType` + `optionKey` (la première correspondance gagne ; pas de doublon).

- `subscriptions` : `{ powerClass, monthlyCost }`. **Toutes les entrées doivent avoir 6, 9, 12, 15, 18, 24,
  30 et 36 kVA** (`DataImport` calcule toutes les offres pour la puissance choisie ; une puissance absente
  fait échouer le tableau). 3 kVA est facultatif.
- `mappings` : parcourus dans l'ordre, le premier qui s'applique gagne. Un mapping a soit `price`, soit
  `hpHcConfig` (`[{ slotType: "HP"|"HC", price }]`).
  - `applicableDays` : **0 = lundi … 6 = dimanche**. Le créneau est daté par sa fin : 00:00 appartient à la veille.
  - `include_holidays: true` : les jours fériés prennent ce mapping (offres week-end).
  - `applicableMonths` (optionnel, **1 = janvier … 12 = décembre**) : prix saisonniers (ex. Octopus hiver
    `[11,12,1,2,3]` / été `[4…10]`). Absent = toute l'année.
- `tempoMappings` + `overridingHpHcKey` (`BLEU_TEMPO`, `ZEN_FLEX`) : offres Tempo / Zen Flex (codes jour 1 bleu,
  2 blanc, 3 rouge).
- `promoNote` (optionnel) : texte affiché en infobulle (icône étiquette) dans le tableau, pour une
  réduction non incluse dans le calcul (ex. TotalEnergies : jusqu'à 10 % en plus sur le kWh HT).
- `comments` : documentation libre, jamais lue par le code. Y noter les écarts avec le schéma.

### 4. Ce que le schéma ne représente pas
Un seul prix par offre, indépendant de la puissance. Quand le site distingue des tranches (ex. 3-6 kVA vs
9 kVA et plus), **garder la valeur 3-6 kVA** (6 kVA pour Octopus) et écrire l'autre dans `comments`.
Ne pas créer d'entrée par tranche sans en parler (cela touche l'enum, l'interface et la clé de recherche).

Conventions déjà en place :
- **Engie** : kWh = fourniture + acheminement + obligations « maximal » ; abonnement = (fourniture + acheminement) / 12.
  Base : acheminement « sans différenciation temporelle » (CU). HP/HC : acheminement « 2 plages » (MUDT).
- **TotalEnergies** : prix **hors remise** (la remise de 10 % sur 3 ans est signalée par `promoNote`).
- **Octopus** : prix TTC de la grille, tranche 6 kVA ; heures creuses = grille HP/HC par défaut de l'application.
- Ne pas renommer les `optionKey` existants (certains, comme `WEEK_END_PLUS_VENREDI`, ne sont pas dans l'enum :
  le JSON est casté sans contrôle de type).

### 5. Éditer le fichier
- Éditer par script (`JSON.parse` / `JSON.stringify(…, null, 4)`), indentation de 4 espaces. La copie de
  travail Windows est en **CRLF** et sans retour final : conserver ce format pour un diff minimal.
- Ne modifier que les entrées concernées ; vérifier avec `git diff --stat` que le reste est identique.

### 6. Vérifier
```bash
npm test        # Jest ; coverage/ est généré
npm run lint
npx tsc --noEmit -p . 2>&1 | grep "^src"   # aucune ligne attendue (les erreurs dans node_modules existent déjà)
```
- **Les tests de `src/scripts/calculators.test.ts` et `utils.test.ts` codent en dur des prix EDF**
  (Bleu Base/HP-HC, Tempo, abonnement 9 kVA Base). Si EDF change, mettre ces constantes à jour et
  recalculer `totalCost` du test Tempo, sinon la CI échoue. Les autres fournisseurs n'ont pas de test de prix.
- Contrôler qu'aucune entrée ne manque une puissance et qu'aucune clé n'est dupliquée.

### 7. Livrer
- Branche dédiée, message de commit et PR **en français**, description **concise** : tarifs changés par
  fournisseur, changements de code éventuels, points à relire (valeurs suspectes, hypothèses).
- Ne rien commiter ni pousser sans demande de l'utilisateur ; ne pas fusionner.

## Points en suspens (octobre 2026)
- Abonnement TotalEnergies HP/HC 36 kVA (53,88 €) suspect dans la grille source (identique à la grille Base d'EDF).
- Engie : aucune date de tarif sur le site ; `lastUpdate` = date de relevé.
- Mapping Tempo/Zen Flex d'EDF (codes 1-2 = Éco, 3 = Sobriété) déduit, non confirmé par le site.
- Abonnements EDF Base 9 à 36 kVA non mis à jour (puissances plus souscriptibles ; `utils.test.ts` s'en sert).

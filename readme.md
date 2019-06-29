# Module d'enrichissement de description de transaction bancaire par l'utilisation du Stanford Named Entity Recognizer (NER)
Projet final du cours IFT630 par Hugo Truchon.

## Mise en contexte
L'objectif de ce projet est de réaliser un algorithme qui prend en entrée des descriptions de transactions bancaire (telles qu'ils apparaissent sur un relevé de carte de guichet / carte de crédit) et retourne à l'utilisateur des informations pertinantes extraite de ces descriptions (infos sur l'entreprise, numéro de sucursale, numéro de téléphone).

Pour ce faire, l'algorithme combinera les résultats de deux outils : 
- Le Stanford Named Entity Recognizer, un programme utilisant l'intelligence artificiel pour reconnaitre des entitées (entreprise, lieu, personne) dans une chaine de texte.
- L'api de recherche de DuckDuckGo, qui permet d'obtenir des snippets d'information de sources variées pour des entitées connues.

L'utilisation des concepts de parallélisme sont centré sur ces deux outils. Le premier utilise beaucoup de temps CPU, donc sera distribué sur plusieurs thread et le deuxième nécessite l'attente de la réponse de l'api, alors les requêtes seront gérer avec des promesses Javascript.

## Technologies utilisés
L'algorithme sera programmer en Javascript pour être exécuter dans Nodejs. Ce langage fournis plusieurs outils pour rendre du code concurrent (promesse, child process de Nodejs) et il facilite le travail avec les résultats en JSON d'api web tel l'api de recherche DuckDuckGo.

## Description des hypothèses
En principe, la version de l'algorithme utilisant le parallélisme sera beaucoup plus rapide. Par contre, comme une partie du traitement repose sur un api externe (api DuckDuckGo pour la recherche), il est fort probable qu'il y ai beaucoup de variabilité dans les résultats. L'utilisation d'un langage de haut niveau (JS) aura probablement aussi un impact mineur sur la variabilité.

## Problèmes potentiels
Tout d'abord, les appels fréquent à l'api de recherche de DuckDuckGo causera peut-être des difficultés. Ces dernier indique dans leur documentation que le nombre de requête à l'api est restrain, ce qui devra surment être mitiguer en créent un délais entre les reqêtes quand il y en a beaucoup.

Aussi, l'utilisation en multithread du Named Entity Recognizer sera surment un défis étant donnée qu'il sera appelé à partir d'un programme en Javascript. Une lecture de la documentation de Nodejs laisse entrevoir qu'il est possible d'exécuter du JS sur plusieurs thread, mais plus d'expérimentation sera nécessaire.

Finalement, le Named Entity Recognizer n'est pas exactement fait pour fonctionner avec le type de description un peut cryptique qui apparait sur les relevés bancaire. Ça demandera de jouer avec la configuration de l'outil et de bien choisir le modèle d'AI pré-entrainé parmis ceux mis à disposition par Standford.

## Aspect de parallélisme en détail
Le programme principal sera écrit en javascript et la coordination des sous-programmes sera gérer de façon asynchrone.

Les grandes étapes à exécuter sont les suivantes:
- [1] Détection des entités avec le NER
- [2] Recherche d'information sur les entitées avec l'api de recherche de DuckDuckGo

### Traitement en batch
L'idée est de diviser les traitements en deux file d'attente et de wrapper chaque description de transaction dans un objet Job qui progressera d'une file à l'autre. D'abord, un certain nombre de worker feront les appels au NER [1] et placeront au fur et à mesure les résultats dans la seconde file. Dans le thread principal, à mesure que des éléments sont ajouté à la 2ieme file de traitement, des appels à l'api DuckDuckGo [2] seront effectué de façon asynchrone avec des promesses Javascript. Voir le diagramme ci-bas.

#### File d'exécution
![File d'execution](https://github.com/truchonh/transaction_description_enrichment/blob/master/File_execution.png)
#### Traitements concurrents
![Traitements concurrents](https://github.com/truchonh/transaction_description_enrichment/blob/master/traitements_concurrents.png)

## Exemple d'entré / sortie
description: "AMZN Mktp CA*M656S0FL2 WWW.AMAZON.CAON"

entitées: ["Amazon"]

```json
reponse: {
  "amazon": {
    "type": "entreprise",
    "description": "Amazon.com, Inc. (NASDAQ : AMZN7) est une entreprise de commerce électronique nord-américaine basée à Seattle. Elle est un des géants du Web, regroupés sous l'acronyme GAFAM8, aux côtés de Google, Apple, Facebook et Microsoft."
  }
}
```

## Idée générale de l'algorithme principal
L'algorithme ci-dessous est le point de départ. Les performances du programme final seront comparé à celui-ci.
```javascript
/*******************************************************************************
Algorithme naif pour l'extraction d'information.

À noter que tout le traitement est séquentiel et pour traiter plusieurs 
description, il faut appeler la fonction plusieurs fois séquentiellement.
*******************************************************************************/

function parseDescription(description) {
  // Pré-traitement pour retirer les numéros de sucursale, no de téléphone, et
  // autre pattern récurant qui ne sont pas pertinant.
  let processedDescription = preProcess(description);

  // Appel à l'IA (Stanford Named Entity Recognizer).
  let entities = NER.parse(processedDescription);

  // Récupération d'informations du web.
  for (let entity of entities) {
    if (entity.type === 'organization') {
      let webInfo = duckDuckGo.search(entity.name);
      return webInfo;
    }
  }
}
```

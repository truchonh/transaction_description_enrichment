# Module d'enrichissement de description de transaction bancaire en parallèle utilisant le "Stanford Named Entity Recognizer (NER)"
Projet final du cours IFT630

## Fonctionalitée
Une description de transaction bancaire est passé en entré au module et un document JSON est retourné avec des informations sur chaque entité trouvé dans la chaine d'entré.

## Aspect de parallélisme
Le programme principal sera écrit en javascript et la coordination des sous-programmes sera gérer de façon asynchrone.

Les tâches à exécuter sont les suivantes:
- [1] Détection des entités avec le NER
- [2] Récupération des données local sur les entitées connue
- [3] Recherche d'information sur les entitées non connue avec l'api de recherche de DuckDuckGo

Ordre d'exécution:
[1] -> ([2] || [3])

## Utilisation de worker pour les traitements en batch
Le module pourra aussi recevoir une liste de description. Les descriptions sont placé dans une file d'attente et sont traité en parallèle par plusieurs workers.

## Exemple d'entré / sortie
description: "AMZN Mktp CA*M656S0FL2 WWW.AMAZON.CAON"

entitées: ["Amazon"]

```reponse: {
  "amazon": {
    "type": "entreprise",
    "description": "Amazon.com, Inc. (NASDAQ : AMZN7) est une entreprise de commerce électronique nord-américaine basée à Seattle. Elle est un des géants du Web, regroupés sous l'acronyme GAFAM8, aux côtés de Google, Apple, Facebook et Microsoft."
  }
}
```

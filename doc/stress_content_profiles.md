# RH0 Stress Content Profiles

Date: 2026-05-16
Module: `theme_liquid_glass_v2`
Scope: reusable official fixtures for responsive/content-stress hardening

## Purpose

These profiles freeze the normal and stress values used by the RH0 runner and all
later hardening slices. The stress profile simulates realistic Odoo dynamic content
without requiring a permanent database mutation. The runner may inject the strings
into the browser DOM for measurement. Future database-backed fixtures must reuse the
same semantic values.

## Profile IDs

| ID | Meaning |
|---|---|
| `normal` | Current Odoo/BAO content, no artificial expansion |
| `stress` | Official long-content fixture, applied consistently to relevant surfaces |

## Normal Profile

Normal profile expectations:

- usual Odoo labels and BAO labels;
- 3 to 5 visible columns when the route naturally exposes them;
- 1 to 3 smartbuttons if the active form naturally exposes them;
- 3 to 5 notebook tabs if the active form naturally exposes them;
- ordinary company and user names;
- ordinary badges and statuses;
- ordinary dropdown length.

Normal profile is not a closure shortcut. It is only the baseline that proves the
theme still works in common Odoo usage.

## Stress Profile Values

### Long Titles

| Fixture key | Value |
|---|---|
| `breadcrumb_level_1` | `Achats internationaux et operations multi-sites avec controle budgetaire regional` |
| `breadcrumb_level_2` | `Demandes de prix fournisseurs avec approbation qualite logistique et finance` |
| `record_title` | `RFQ-2026-VERY-LONG-DOCUMENT-TITLE-WITH-SUPPLIER-REFERENCE-OPERATIONS-AND-BUDGET-VALIDATION-000001` |
| `module_title` | `Pilotage achats BAO avec documents longs, filtres dynamiques et validations multiples` |

### Long Labels

| Fixture key | Value |
|---|---|
| `field_label` | `Libelle de champ tres long genere par une personnalisation Odoo de production` |
| `settings_label` | `Configuration avancee du theme BAO backend avec aide operationnelle longue` |
| `tab_label` | `Informations complementaires de conformite fournisseur et logistique internationale` |
| `button_label` | `Confirmer et envoyer la demande de validation budgetaire complete` |
| `dropdown_item` | `Filtre dynamique tres long avec contexte societe, equipe, statut et periode fiscale` |

### Company And User

| Fixture key | Value |
|---|---|
| `company_name` | `My Company International Procurement And Logistics Shared Services West Africa` |
| `user_name` | `Administrateur BAO Operations Finance Supply Chain Tres Long` |

### Smartbuttons

Minimum stress requirement:

- 6 smartbuttons visible or simulated;
- at least one six-digit counter;
- at least one long label;
- count and label must remain readable or intentionally moved to overflow.

Official values:

| Count | Label |
|---:|---|
| `123456` | `Demandes associees tres longues` |
| `987654` | `Factures fournisseur en attente` |
| `456789` | `Livraisons partielles bloquees` |
| `234567` | `Articles avec controle qualite` |
| `345678` | `Messages et activites` |
| `567890` | `Incidents logistiques ouverts` |

### Notebook Tabs

Minimum stress requirement:

- 8 tabs;
- at least one very long tab;
- active tab remains visible after switching;
- rightmost tab remains reachable.

Official tab labels:

1. `Informations generales`
2. `Autres informations`
3. `Produits et lignes detaillees`
4. `Livraisons et reception`
5. `Facturation fournisseur`
6. `Controle qualite et conformite`
7. `Notes internes et communications`
8. `Historique tres long des validations et exceptions operationnelles`

### Table Columns

Minimum stress requirement:

- 10 columns;
- long headers;
- long cell values;
- at least one long numeric value;
- at least one long badge/status value.

Official column headers:

1. `Reference document tres longue`
2. `Fournisseur ou partenaire operationnel`
3. `Societe et entrepot de rattachement`
4. `Responsable approvisionnement`
5. `Date planifiee avec fuseau`
6. `Montant total devise longue`
7. `Statut operationnel detaille`
8. `Priorite et niveau de risque`
9. `Derniere activite chatter`
10. `Action suivante recommandee`

Official cell values:

| Type | Value |
|---|---|
| `reference` | `PO-RFQ-2026-LONG-REFERENCE-SUPPLIER-OPERATIONS-VALIDATION-000000123456789` |
| `partner` | `Fournisseur International Avec Nom Commercial Tres Long Et Division Regionale` |
| `company` | `My Company International Procurement And Logistics Shared Services West Africa` |
| `amount` | `9,876,543,210,987.65 XAF` |
| `status` | `Validation budgetaire et logistique en attente de confirmation finale` |
| `risk` | `Priorite critique avec blocage reception et controle qualite` |
| `activity` | `Derniere activite planifiee avec commentaire tres long et plusieurs destinataires` |
| `next_action` | `Relancer fournisseur, confirmer transport, valider budget et mettre a jour les lignes` |

### Badges And States

Official badge/state values:

- `Validation budgetaire en attente`
- `Controle qualite bloque`
- `Reception partielle tres en retard`
- `A retraiter par equipe approvisionnement`
- `Exception logistique longue`

### Dropdown

Minimum stress requirement:

- 12 items;
- at least 4 long labels;
- hover/selected/focus visible;
- no clipping.

Official dropdown items:

1. `Filtrer par fournisseur strategique international`
2. `Grouper par statut operationnel detaille`
3. `Afficher uniquement les validations bloquees`
4. `Commandes avec reception partielle en retard`
5. `Documents sans responsable approvisionnement`
6. `Factures fournisseur en attente de rapprochement`
7. `Articles avec controle qualite obligatoire`
8. `Exceptions transport et entrepot`
9. `Favori equipe finance achats`
10. `Favori direction operations multi-sites`
11. `Exporter la selection avec contexte complet`
12. `Archiver les elements eligibles apres validation`

### Modal / Dialog

Official modal title:

`Preferences utilisateur BAO avec informations de securite, notifications et options avancees de communication`

Official modal body:

`Ce panneau contient un texte long representatif des dialogues Odoo en production, avec plusieurs champs, aides, avertissements, actions secondaires, et informations qui ne doivent jamais pousser le dialogue hors du viewport ni masquer les boutons de validation.`

Official modal footer actions:

- `Enregistrer les preferences et appliquer les changements`
- `Annuler sans perdre la navigation courante`

## Runner Application Rules

- `normal` profile must never mutate text content.
- `stress` profile may mutate browser DOM text for measurement only.
- DOM stress injection must be non-persistent and must not write the database.
- If the live route does not contain enough natural elements for a fixture, the
  report must mark the row as `fixture_gap`, not `passed`.
- Synthetic labels may be used to force width/content stress, but component closure
  still requires later proof on real Odoo routes or database-backed records.

## Closure Use

These fixtures are mandatory for P0 and P1 closure. A component that passes only the
normal profile remains `content_stress_safe=no`.


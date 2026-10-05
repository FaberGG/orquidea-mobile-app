# Graph Report - .  (2026-10-04)

## Corpus Check
- Corpus is ~37,485 words - fits in a single context window. You may not need a graph.

## Summary
- 942 nodes · 1396 edges · 67 communities (56 shown, 11 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 86 edges (avg confidence: 0.83)
- Token cost: 561,085 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Pantallas y tema visual|Pantallas y tema visual]]
- [[_COMMUNITY_OpenAPI rutas y respuestas|OpenAPI: rutas y respuestas]]
- [[_COMMUNITY_Auth sesión y mensajes|Auth: sesión y mensajes]]
- [[_COMMUNITY_Docs de arquitectura y convenciones|Docs de arquitectura y convenciones]]
- [[_COMMUNITY_Sprints, historias y ADRs|Sprints, historias y ADRs]]
- [[_COMMUNITY_Navegación y pantallas raíz|Navegación y pantallas raíz]]
- [[_COMMUNITY_Cliente HTTP y errores|Cliente HTTP y errores]]
- [[_COMMUNITY_Dependencias Expo|Dependencias Expo]]
- [[_COMMUNITY_OpenAPI esquemas DTO|OpenAPI: esquemas DTO]]
- [[_COMMUNITY_Capa API y feature Especies|Capa API y feature Especies]]
- [[_COMMUNITY_Permisos implementación|Permisos: implementación]]
- [[_COMMUNITY_Layout raíz y proveedores|Layout raíz y proveedores]]
- [[_COMMUNITY_OpenAPI respuesta de error|OpenAPI: respuesta de error]]
- [[_COMMUNITY_Configuración app.json|Configuración app.json]]
- [[_COMMUNITY_OpenAPI campos de usuario|OpenAPI: campos de usuario]]
- [[_COMMUNITY_Feature Auth (HU-1, HU-2)|Feature Auth (HU-1, HU-2)]]
- [[_COMMUNITY_Permisos Can y RoleProvider|Permisos: Can y RoleProvider]]
- [[_COMMUNITY_Dependencias de desarrollo|Dependencias de desarrollo]]
- [[_COMMUNITY_Scripts npm|Scripts npm]]
- [[_COMMUNITY_Primitivas UI|Primitivas UI]]
- [[_COMMUNITY_Reglas ESLint de capas|Reglas ESLint de capas]]
- [[_COMMUNITY_Config Prettier|Config Prettier]]
- [[_COMMUNITY_Config TypeScript|Config TypeScript]]
- [[_COMMUNITY_Feature Administradores (HE-02)|Feature Administradores (HE-02)]]
- [[_COMMUNITY_OpenAPI TaxonDto|OpenAPI: TaxonDto]]
- [[_COMMUNITY_DTOs de autenticación|DTOs de autenticación]]
- [[_COMMUNITY_Config Jest|Config Jest]]
- [[_COMMUNITY_Splash animado (nativo)|Splash animado (nativo)]]
- [[_COMMUNITY_Splash animado (web)|Splash animado (web)]]
- [[_COMMUNITY_Campo alimentación|Campo alimentación]]
- [[_COMMUNITY_Campo género|Campo género]]
- [[_COMMUNITY_Campo orden|Campo orden]]
- [[_COMMUNITY_Campo familia|Campo familia]]
- [[_COMMUNITY_Campo rol en humedal|Campo rol en humedal]]
- [[_COMMUNITY_Campo nombre científico|Campo nombre científico]]
- [[_COMMUNITY_Campo nombre vernáculo|Campo nombre vernáculo]]
- [[_COMMUNITY_Campo categoría|Campo categoría]]
- [[_COMMUNITY_Campo estado de conservación|Campo estado de conservación]]
- [[_COMMUNITY_Campo fecha de creación|Campo fecha de creación]]
- [[_COMMUNITY_Campo foto|Campo foto]]
- [[_COMMUNITY_Campo fecha de actualización|Campo fecha de actualización]]
- [[_COMMUNITY_Configuración de entorno|Configuración de entorno]]
- [[_COMMUNITY_Hooks transversales|Hooks transversales]]
- [[_COMMUNITY_Metadatos package.json|Metadatos package.json]]
- [[_COMMUNITY_Cliente TanStack Query|Cliente TanStack Query]]
- [[_COMMUNITY_Fallback localStorage web|Fallback localStorage web]]
- [[_COMMUNITY_Esquemas Zod de DTOs|Esquemas Zod de DTOs]]
- [[_COMMUNITY_Ícono animado|Ícono animado]]
- [[_COMMUNITY_Borrado seguro|Borrado seguro]]
- [[_COMMUNITY_Escritura segura|Escritura segura]]
- [[_COMMUNITY_Rutas de especies|Rutas de especies]]
- [[_COMMUNITY_APP_CONFIG|APP_CONFIG]]
- [[_COMMUNITY_Splash overlay|Splash overlay]]
- [[_COMMUNITY_Índice de tipos auth|Índice de tipos auth]]
- [[_COMMUNITY_Índice de esquemas auth|Índice de esquemas auth]]
- [[_COMMUNITY_tsconfig estricto|tsconfig estricto]]

## God Nodes (most connected - your core abstractions)
1. `dependencies` - 30 edges
2. `useTheme()` - 20 edges
3. `Spacing` - 17 edges
4. `ARQUITECTURA` - 17 edges
5. `responses` - 16 edges
6. `ThemedText()` - 16 edges
7. `devDependencies` - 14 edges
8. `properties` - 14 edges
9. `expo` - 13 edges
10. `scripts` - 13 edges

## Surprising Connections (you probably didn't know these)
- `CI workflow (lint, prettier, tsc, tests)` --conceptually_related_to--> `Configuracion Prettier`  [INFERRED]
  .github/workflows/ci.yml → .prettierrc.json
- `typedRoutes` --shares_data_with--> `NAVEGACION`  [INFERRED]
  app.json → docs/architecture/NAVEGACION.md
- `Plugin expo-secure-store` --implements--> `Sesion JWT en expo-secure-store`  [INFERRED]
  app.json → docs/architecture/ARQUITECTURA.md
- `expo-env.d.ts (generated Expo types)` --references--> `ADR-0007 Quality tools (ESLint, Prettier, husky, commitlint, CI)`  [INFERRED]
  expo-env.d.ts → docs/decisions/0007-herramientas-de-calidad.md
- `Modelo de ramas main/develop/feature` --semantically_similar_to--> `Flujo de trabajo develop -> PR -> squash merge`  [INFERRED] [semantically similar]
  docs/conventions/GIT.md → CONTRIBUTING.md

## Hyperedges (group relationships)
- **Architecture rules set (features, thin routes, layer deps, data flow)** — arquitectura_feature_based, arquitectura_thin_routes, arquitectura_layer_dependency_rules, arquitectura_data_flow, adr_0001_arquitectura_por_features [EXTRACTED 0.95]
- **Permission-based UI (matrix, Can, Stack.Protected, ADR-0002)** — roles_permission_matrix, roles_can_component, navegacion_stack_protected, adr_0002_permisos_sobre_roles, roles_role_hierarchy [EXTRACTED 0.95]
- **Quality gates pipeline (CI, Prettier, ESLint rules, PR template)** — github_ci_workflow, prettierrc_prettier_config, codigo_automated_lint_rules, github_pull_request_template, agents_quality_gates [INFERRED 0.85]
- **Quality tooling decisions (ADR-0007, ADR-0008, ESLint config)** — adr_0007_quality_tools, adr_0008_no_commit_validations, eslint_config_layer_boundaries [INFERRED 0.85]
- **HE-01 access stories** — sprint_01_hu_1_login, sprint_01_hu_1_1_password_reset, sprint_01_hu_3_logout [EXTRACTED 1.00]
- **Sprint 1 epics HE-01..HE-03** — historias_usuario_he_01, historias_usuario_he_02, historias_usuario_he_03 [EXTRACTED 1.00]
- **Tab shell: layout, AppTabs and tab screens** — tabs_layout_default, app_tabs_apptabs, index_homescreen, account_accountscreen, explore_tabtwoscreen [INFERRED 0.85]
- **Root startup: fonts, session, splash, protected stack** — layout_rootlayout, layout_splashscreencontroller, layout_rootnavigator, use_session_usesession [EXTRACTED 1.00]
- **Components consuming theme tokens** — themed_text_themedtext, form_message_formmessage, form_screen_formscreen, theme_tokens [EXTRACTED 0.95]
- **UI primitives consuming theme tokens** — button_button, text_field_textfield, checkbox_checkbox, icon_icon, themed_view_themedview, theme_colors [INFERRED 0.85]
- **Admins feature layers** — admins_api_readme_admins_api, admins_hooks_readme_admin_hooks, admins_components_readme_admin_screens, admins_schemas_readme_admin_schemas, admins_types_readme_admin_types [EXTRACTED 1.00]
- **Auth screens share header and footer components** — login_screen_loginscreen, register_screen_registerscreen, account_screen_accountscreen, auth_header_authheader, auth_footer_authfooter [EXTRACTED 0.95]
- **API call to DTO mapping to domain User** — auth_api_login, auth_api_getme, auth_mappers_tologinresult, auth_mappers_touser [EXTRACTED 0.95]
- **Auth session lifecycle hooks** — use_login_uselogin, use_logout_uselogout, use_session_usesession, use_register_useregister [INFERRED 0.85]
- **Auth form validation schemas** — login_schema_loginschema, register_schema_registerschema, auth_dto_schema_loginresponsedtoschema [INFERRED 0.75]
- **HTTP client request pipeline** — client_request, auth_interceptor_getauthorizationheader, auth_interceptor_handleunauthorized, api_error_apierror [EXTRACTED 1.00]
- **Species feature layers** — species_api_readme_species_api, species_hooks_readme_species_hooks, species_components_readme_species_components, species_schemas_readme_species_schema, species_types_readme_species_types [INFERRED 0.85]
- **Permission check flow** — can_component_can, use_permission_usepermission, can_can, permissions_role_permissions, role_context_usecurrentrole [EXTRACTED 0.95]
- **Session role injection into permissions** — app_providers_appproviders, app_providers_sessionroleprovider, app_providers_usesession, role_context_roleprovider [EXTRACTED 0.95]

## Communities (67 total, 11 thin omitted)

### Community 0 - "Pantallas y tema visual"
Cohesion: 0.06
Nodes (65): AUTH_LABELS, styles, AppTabs(), CustomTabList(), styles, AuthFooter(), AuthFooterProps, styles (+57 more)

### Community 1 - "OpenAPI: rutas y respuestas"
Cohesion: 0.05
Nodes (78): content, description, content, description, description, content, description, content (+70 more)

### Community 2 - "Auth: sesión y mensajes"
Cohesion: 0.05
Nodes (41): isApiError(), getMe(), login(), ROLE_FROM_API, result, userDto, toLoginResult(), toUser() (+33 more)

### Community 3 - "Docs de arquitectura y convenciones"
Cohesion: 0.06
Nodes (64): ADR-0001 Arquitectura por features con rutas delgadas, ADR-0002 Permisos derivados del rol, ADR-0003 TanStack Query para estado de servidor, TanStack Query (@tanstack/react-query), AGENTS.md (instrucciones para agentes IA), Regla: consultar docs versionadas de Expo, no la memoria, Quality gates (lint, format:check, typecheck), Contrato de API: interpretacion y brechas (+56 more)

### Community 4 - "Sprints, historias y ADRs"
Cohesion: 0.05
Nodes (55): (admin) route group, Hiding routes in UI is not security; API validates, (admin)/admins routes (superadmin only), Form validation with react-hook-form + zod schemas, ADR-0004 React Hook Form + Zod, ADR-0005 jest-expo + Testing Library, jest-expo preset with React Native Testing Library, ADR-0006 Session in expo-secure-store (+47 more)

### Community 5 - "Navegación y pantallas raíz"
Cohesion: 0.06
Nodes (45): AccountScreen route (account), Routes-only rule for src/app, AppTabs (native), AppTabs (web), Auth API DTO types (Spanish fields), authenticatedUserDtoSchema, loginResponseDtoSchema, Validate external API data before mapping (+37 more)

### Community 6 - "Cliente HTTP y errores"
Cohesion: 0.09
Nodes (25): ApiError, ApiErrorKind, ApiErrorOptions, readServerMessage(), getAuthorizationHeader(), handleUnauthorized(), setUnauthorizedHandler(), UnauthorizedHandler (+17 more)

### Community 7 - "Dependencias Expo"
Cohesion: 0.07
Nodes (30): dependencies, expo, expo-constants, expo-device, expo-font, expo-glass-effect, @expo-google-fonts/nunito, expo-image (+22 more)

### Community 8 - "OpenAPI: esquemas DTO"
Cohesion: 0.07
Nodes (28): description, properties, type, description, required, type, components, schemas (+20 more)

### Community 9 - "Capa API y feature Especies"
Cohesion: 0.11
Nodes (27): ApiError, readServerMessage, lib/api public API, Unauthorized callback instead of importing features/auth, HTTP client module (lib/api), getAuthorizationHeader, handleUnauthorized, setUnauthorizedHandler (+19 more)

### Community 10 - "Permisos: implementación"
Cohesion: 0.15
Nodes (18): can(), Can(), CanProps, NON_INHERITABLE, OWN_PERMISSIONS, Permission, ROLE_PERMISSIONS, RoleContext (+10 more)

### Community 11 - "Layout raíz y proveedores"
Cohesion: 0.09
Nodes (17): RootLayout(), RootNavigator(), SplashScreenController(), HomeScreen(), mockSession(), renderAs(), useAppFonts(), AppProviders() (+9 more)

### Community 12 - "OpenAPI: respuesta de error"
Cohesion: 0.08
Nodes (26): description, properties, type, description, example, type, description, example (+18 more)

### Community 13 - "Configuración app.json"
Cohesion: 0.08
Nodes (24): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, reactCompiler, typedRoutes (+16 more)

### Community 14 - "OpenAPI: campos de usuario"
Cohesion: 0.08
Nodes (24): properties, description, example, maxLength, minLength, type, description, example (+16 more)

### Community 15 - "Feature Auth (HU-1, HU-2)"
Cohesion: 0.12
Nodes (22): AccountScreen, getMe, login, register, requestPasswordReset, AuthFooter, AuthHeader, toLoginResult (+14 more)

### Community 16 - "Permisos: Can y RoleProvider"
Cohesion: 0.1
Nodes (21): AppProviders, queryClient (lib/query), SessionRoleProvider, useSession (features/auth), can(role, permission), <Can> component, <Can> component tests, can permission matrix tests (+13 more)

### Community 17 - "Dependencias de desarrollo"
Cohesion: 0.14
Nodes (14): devDependencies, eslint, eslint-config-expo, eslint-config-prettier, eslint-plugin-prettier, jest, jest-expo, prettier (+6 more)

### Community 18 - "Scripts npm"
Cohesion: 0.15
Nodes (13): scripts, android, format, format:check, ios, lint, lint:fix, reset-project (+5 more)

### Community 19 - "Primitivas UI"
Cohesion: 0.2
Nodes (12): Button, Checkbox, Collapsible, Design tokens only rule, Icon, ICONS map, TextField, Colors (light/dark) (+4 more)

### Community 20 - "Reglas ESLint de capas"
Cohesion: 0.2
Nodes (8): BASE_RESTRICTED_PATTERNS, { defineConfig }, eslintPluginPrettierRecommended, expoConfig, NO_APP, NO_FEATURES, NO_PERMISSIONS, NO_UI

### Community 21 - "Config Prettier"
Cohesion: 0.2
Nodes (9): arrowParens, bracketSameLine, endOfLine, printWidth, $schema, semi, singleQuote, tabWidth (+1 more)

### Community 22 - "Config TypeScript"
Cohesion: 0.22
Nodes (8): compilerOptions, paths, strict, types, extends, include, @/*, @/assets/*

### Community 23 - "Feature Administradores (HE-02)"
Cohesion: 0.39
Nodes (8): Admins API (admins.api.ts), API gap B2 (no list/get admins endpoints), Admin screens and AdminForm, Admin hooks, Admins feature (HE-02), Admin schemas, Admin types and DTOs, Standard feature module structure

### Community 24 - "OpenAPI: TaxonDto"
Cohesion: 0.25
Nodes (8): urlFoto, TaxonDto, description, properties, type, description, example, type

### Community 25 - "DTOs de autenticación"
Cohesion: 0.25
Nodes (7): ApiRoleDto, AuthenticatedUserDto, LoginRequestDto, LoginResponseDto, PasswordRecoveryRequestDto, PasswordResetRequestDto, RegisterRequestDto

### Community 26 - "Config Jest"
Cohesion: 0.29
Nodes (7): jest, moduleNameMapper, preset, testTimeout, ^@/(.*)$, ^@/assets/(.*)$, \\.css$

### Community 27 - "Splash animado (nativo)"
Cohesion: 0.29
Nodes (4): glowKeyframe, keyframe, logoKeyframe, styles

### Community 28 - "Splash animado (web)"
Cohesion: 0.29
Nodes (4): glowKeyframe, keyframe, logoKeyframe, styles

### Community 29 - "Campo alimentación"
Cohesion: 0.33
Nodes (6): description, example, maxLength, minLength, type, alimentacion

### Community 30 - "Campo género"
Cohesion: 0.33
Nodes (6): description, example, maxLength, minLength, type, genus

### Community 31 - "Campo orden"
Cohesion: 0.33
Nodes (6): description, example, maxLength, minLength, type, order

### Community 32 - "Campo familia"
Cohesion: 0.33
Nodes (6): description, example, maxLength, minLength, type, family

### Community 33 - "Campo rol en humedal"
Cohesion: 0.33
Nodes (6): rolEnHumedal, description, example, maxLength, minLength, type

### Community 34 - "Campo nombre científico"
Cohesion: 0.33
Nodes (6): scientificName, description, example, maxLength, minLength, type

### Community 35 - "Campo nombre vernáculo"
Cohesion: 0.33
Nodes (6): vernacularName, description, example, maxLength, minLength, type

### Community 36 - "Campo categoría"
Cohesion: 0.4
Nodes (5): description, enum, example, type, categoria

### Community 37 - "Campo estado de conservación"
Cohesion: 0.4
Nodes (5): description, enum, example, type, estadoConservacion

### Community 38 - "Campo fecha de creación"
Cohesion: 0.4
Nodes (5): description, example, format, type, fechaCreacion

### Community 39 - "Campo foto"
Cohesion: 0.4
Nodes (5): description, format, type, foto, properties

### Community 40 - "Campo fecha de actualización"
Cohesion: 0.4
Nodes (5): description, example, format, type, fechaActualizacion

### Community 41 - "Configuración de entorno"
Cohesion: 0.4
Nodes (5): APP_CONFIG, Single-read env configuration policy, getEnv (lazy cached), parseEnv, parseEnv tests

### Community 42 - "Hooks transversales"
Cohesion: 0.5
Nodes (5): Cross-cutting hooks (src/hooks), useAppFonts, useColorScheme (native), useColorScheme (web, hydration-safe), useTheme

### Community 43 - "Metadatos package.json"
Cohesion: 0.4
Nodes (4): main, name, private, version

### Community 47 - "Fallback localStorage web"
Cohesion: 0.67
Nodes (3): ADR-0006 web not priority, localStorage fallback, getSecureItem, getSecureItem (web localStorage fallback)

## Knowledge Gaps
- **406 isolated node(s):** `$schema`, `singleQuote`, `printWidth`, `tabWidth`, `semi` (+401 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `schemas` connect `OpenAPI: esquemas DTO` to `OpenAPI: TaxonDto`, `OpenAPI: respuesta de error`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `paths` connect `OpenAPI: rutas y respuestas` to `OpenAPI: esquemas DTO`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `ARQUITECTURA` (e.g. with `Plantilla de issue Historia de usuario` and `ADR-0001 Arquitectura por features con rutas delgadas`) actually correct?**
  _`ARQUITECTURA` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `singleQuote`, `printWidth` to the rest of the system?**
  _406 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Pantallas y tema visual` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `OpenAPI: rutas y respuestas` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Auth: sesión y mensajes` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
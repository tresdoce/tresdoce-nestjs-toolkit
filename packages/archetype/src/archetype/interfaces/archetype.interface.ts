export interface IArchetypeAuthor {
  name: string;
  email: string;
  url: string;
}

export interface IArchetypeRepository {
  type: string;
  url: string;
}

export interface IArchetypeVersion {
  /** Versión instalada de `@tresdoce-nestjs-toolkit/archetype`. */
  archetypeVersion: string;
}

export interface IApplicationInfo {
  appStage: string;
  apiPrefix: string;
  name: string;
  version: string;
  description: string;
  author: IArchetypeAuthor;
  repository: IArchetypeRepository;
  homepage: string;
  /** Dependencias `@tresdoce-nestjs-toolkit/*` y `@nestjs/*` del `package.json` de la app. */
  dependencies: Record<string, string>;
  /** DevDependencies `@tresdoce-nestjs-toolkit/*` y `@nestjs/*` del `package.json` de la app. */
  devDependencies: Record<string, string>;
  /** Valor de la variable de entorno `CURRENT_COMMIT` (o `''`). */
  currentCommit: string;
  /** Campo `seed` del `package.json` de la app (o `{}`). */
  seed: Record<string, any>;
}

export type IArchetypeManifest = IArchetypeVersion & IApplicationInfo;

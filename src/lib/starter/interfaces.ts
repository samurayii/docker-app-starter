export interface IStarterAppConfig {
    name: string
    cwd: string
    command: string
    critical: boolean
    env: {
        scope: string
        include_regexp: string
        keys: {
            [key: string]: string
        }
    }
}
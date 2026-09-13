# 📋 GitHub Templates

Esta carpeta contiene templates y configuraciones para el flujo de trabajo de GitHub en AppSalud.

## 📝 Pull Request Templates

### Template Principal (Predeterminado)

**Archivo:** `PULL_REQUEST_TEMPLATE.md`

Este es el template que se auto-rellena cuando creas un nuevo PR. Es un template genérico profesional que se adapta a cualquier tipo de cambio:

✅ **Utiliza este template para:**
- Nuevas features
- Bug fixes
- Refactoring
- Documentación
- Cambios de seguridad
- Optimizaciones
- Tests
- Configuración

**Secciones incluidas:**
1. **Descripción** - Qué se cambió y por qué
2. **Tipo de cambio** - Checkbox para categorizar
3. **Por qué** - Motivación y contexto
4. **Cómo se testea** - Plan de pruebas
5. **Checklist** - Verificaciones antes de merge
6. **Cambios** - Resumen de archivos
7. **Seguridad** - Consideraciones si aplica
8. **Performance** - Consideraciones si aplica
9. **Breaking changes** - Si hay cambios que rompen
10. **Screenshots** - Para cambios visuales
11. **Links relacionados** - References

---

## 🚀 Cómo Usar

### Crear un Nuevo PR

1. **Opción automática:**
   - Crea el PR normalmente en GitHub
   - El template se auto-rellena automáticamente

2. **Opción manual:**
   - Copiar el contenido de `PULL_REQUEST_TEMPLATE.md`
   - Pegar en la descripción del PR
   - Llenar cada sección

### Llenar el Template

**Para cada PR:**

```markdown
## 📝 Descripción
Explica qué se cambió. Sé específico y claro.

## 🎯 Tipo de Cambio
Marca el checkbox que aplica (ej: ✨ Nuevo feature)

## 🤔 Por Qué
- Motivación: Por qué era necesario
- Contexto: Información relacionada
- Beneficios: Qué gana el proyecto

## 🧪 Cómo Se Testea
1. Paso 1
2. Paso 2
3. Paso 3

Casos a verificar:
- [ ] Caso principal
- [ ] Edge cases
- [ ] Errores
- [ ] Backward compatibility

## 📋 Checklist
Revisa cada punto antes de hacer merge:
- [ ] Código limpio y formateado
- [ ] Cambios revisados
- [ ] Documentación actualizada
- [ ] Tests agregados y pasan
- [ ] Sin breaking changes (o documentados)
- [ ] Sin dead code

## (Otras secciones)
Llenar solo si aplican a este PR
```

---

## 📌 Guías por Tipo de Cambio

### 🐛 Bug Fix

```
Descripción: "Cambio que soluciona [problema específico]"
Tipo: Bug fix
Cómo se testea: Reproduce el bug → Verifica que está arreglado
Checklist: Especial atención a backward compatibility
```

### ✨ Nuevo Feature

```
Descripción: "Nueva funcionalidad: [descripción clara]"
Tipo: Nuevo feature
Por qué: Requisito del usuario, mejora de UX, etc.
Cómo se testea: Pasos detallados del flujo
Checklist: Tests, documentación, ejemplos
```

### 🔐 Seguridad

```
Descripción: "Mejora de seguridad: [qué se arregla]"
Tipo: Mejora de seguridad
Seguridad: Detalla la vulnerabilidad y cómo se arregla
Por qué: Criticidad y contexto
Checklist: Auditoría, testing de edge cases
```

### ⚡ Performance

```
Descripción: "Optimización: [qué se optimiza]"
Tipo: Optimización de rendimiento
Performance: Métricas antes/después
Cómo se testea: Benchmarking, profiling
Checklist: Validación en staging
```

### 📚 Documentación

```
Descripción: "Documentación: [qué se documenta]"
Tipo: Documentación
Por qué: Falta documentación, inconsistencias, etc.
Checklist: Enlaces funcionan, formato correcto
```

### ♻️ Refactoring

```
Descripción: "Refactoring: [qué se mejora]"
Tipo: Refactoring
Por qué: Deuda técnica, mantenibilidad, etc.
Cómo se testea: Tests no cambian, funcionalidad igual
Breaking changes: Verificar que no hay
```

---

## ✅ Checklist Pre-Merge

Antes de hacer merge a main, verifica:

- [ ] **Descripción clara** - Alguien que no conoce el proyecto lo entiende
- [ ] **Tipo de cambio marcado** - El checkbox correspondiente está checked
- [ ] **Contexto completo** - Se entiende por qué fue necesario
- [ ] **Plan de pruebas** - Test cases documentados y verificados
- [ ] **Backward compatible** - O si no, está documentado
- [ ] **Tests nuevos** - Pruebas para la nueva funcionalidad
- [ ] **Tests antiguos pasan** - Sin regresiones
- [ ] **Código limpio** - Sin warnings, bien formateado
- [ ] **Documentación** - Actualizada si es necesario
- [ ] **Sin breaking changes ocultos** - O está documentado
- [ ] **Performance verificado** - Si es relevante
- [ ] **Seguridad revisada** - Si es relevante
- [ ] **Screenshots** - Si hay cambios visuales

---

## 🔍 Code Review Checklist

Para los revisores:

- [ ] ¿La descripción es clara?
- [ ] ¿El código es legible?
- [ ] ¿Hay tests suficientes?
- [ ] ¿Hay vulnerabilidades potenciales?
- [ ] ¿Afecta performance?
- [ ] ¿Hay cambios no relacionados?
- [ ] ¿Documentación está actualizada?
- [ ] ¿Los tests pasan?
- [ ] ¿Es backward compatible?

---

## 📚 Recursos

- [PR Style Guide](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Best Practices](https://www.atlassian.com/git/tutorials/making-a-pull-request)

---

## 🤖 Generado con Claude Code

Este README y los templates fueron creados para mantener un estándar de calidad consistente en los Pull Requests.

**Última actualización:** 13 de Septiembre, 2026

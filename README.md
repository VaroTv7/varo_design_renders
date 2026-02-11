# Interiorismo AI - Viewport to Render

![Banner](public/vite.svg)

**Transforma tus capturas del viewport en renders fotorrealistas profesionales con IA.**

Esta aplicación está diseñada para arquitectos y diseñadores de interiores que desean acelerar su flujo de trabajo. Sube una captura básica de tu modelo 3D, añade referencias de estilo y objetos, y deja que la IA (integrada con Nano Banana Pro) genere visualizaciones impresionantes en segundos.

## 🚀 Características Principales

- **Renderizado AI**: Conversión instantánea de geometría básica a imágenes fotorrealistas.
- **Editor Avanzado de Canvas**:
    - **Zonas de Muebles**: Dibuja rectángulos para indicar dónde se debe colocar cada objeto.
    - **Anotaciones (Pincel)**: Dibuja flechas o notas a mano alzada para dar contexto extra a la IA.
    - **Máscara Inteligente**: El sistema genera automáticamente una máscara de control para la generación.
- **Control de Estilo**: Sube imágenes de referencia para guiar la estética, iluminación y materiales.
- **Integración de Mobiliario**: Añade recortes de muebles u objetos específicos que la IA integrará perfectamente en la escena.
- **Presets de Prompts**: Guarda y carga diferentes versiones de tus instrucciones de sistema (ej. "Minimalista", "Industrial").
- **Historial Local**: Opción para guardar o no el historial de generaciones.
- **Ajustes de Salida**: Soporte para Escalado (Upscale) hasta 4x y formatos PNG, WEBP o JPG.
- **Diseño Responsivo**: Interfaz optimizada para Móviles, Tablets, PC y TV (100% zoom).
- **Localización Completa**: Interfaz totalmente en español.
- **Modo Debug**: Prueba la aplicación sin consumir créditos de API mediante el sistema de Mock integrado.

## 🛠️ Tecnologías

- **Frontend**: React + TypeScript + Vite
- **Estilos**: CSS Modules con diseño Glassmorphism y temas oscuros premium.
- **Iconos**: Lucide React
- **Animaciones**: Framer Motion

## 📦 Instalación y Uso

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/VaroTv7/varo_design_renders.git
    cd varo_design_renders
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Iniciar servidor de desarrollo**:
    ```bash
    npm run dev
    ```

4.  **Configurar API**:
    - Abre la aplicación en tu navegador.
    - Haz clic en el icono de **Ajustes** (engranaje).
    - Desactiva el "Modo Debug".
    - Introduce tu API Key de Nano Banana Pro.

## 🐳 Despliegue con Docker

Puedes desplegar la aplicación fácilmente en cualquier servidor usando Docker.

1.  **Construir y ejecutar**:
    ```bash
    docker-compose up -d --build
    ```

2.  **Acceder**:
    La aplicación estará disponible en `http://localhost:8080`.

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue para discutir cambios mayores antes de enviar un Pull Request.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

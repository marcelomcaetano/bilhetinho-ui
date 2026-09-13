# ==============================================================================
# Dockerfile para a Interface Web (bilhetinho-ui)
# Servidor Web Nginx Alpine ultraleve servindo arquivos estáticos e ES6 Modules
# ==============================================================================
FROM nginx:1.27-alpine

LABEL maintainer="Marcelo M. Caetano"
LABEL description="Interface Web do MVP Bilhetinho servida via Nginx Alpine"

# Remove arquivos de boas-vindas padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia configuração customizada do Nginx com suporte a MIME types e ES6
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia arquivos estáticos da aplicação para a pasta pública do Nginx
COPY index.html musico.html bilhetinho.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/

# Checagem de integridade (Healthcheck)
HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

# Porta HTTP padrão do Nginx
EXPOSE 80

# Inicialização do Nginx em primeiro plano
CMD ["nginx", "-g", "daemon off;"]

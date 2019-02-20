# Build the static assets in the node.js container.
FROM wqp_assets as assets

RUN npm run build


# Base off the community Python image
FROM usgswma/python:debian-slim-stretch-python-3.6-18a15afe7903f13908cc6007c91a0c6f1a981195

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR $HOME

COPY requirements.txt .
COPY requirements-dev.txt .
RUN pip install --no-cache-dir -r requirements.txt -r requirements-dev.txt

# Add source files and pre-compile them
COPY . ./
RUN python -m compileall -f
RUN python -m compileall -f .

# Copy static files from the assets image to this one.
COPY --from=assets /assets/dist /assets

# Use environment variables for application configuration rather than an
# instance/config.py module.
ENV NO_INSTANCE_CONFIG=1
ENV ASSET_MANIFEST_PATH=/assets/rev-manifest.json

USER $USER

EXPOSE 5050

CMD ["gunicorn", "--config", "gunicorn.conf", "wqp:app"]

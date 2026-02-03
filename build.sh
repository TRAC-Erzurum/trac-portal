#!/bin/bash

set -e

GITHUB_REPO_OWNER=""
BUILD_NUM=""
VERSION=""
MODE=""

usage() {
  echo "Kullanım: $0 -o [repo_owner] -m [mode] -b [build_num] -v [version]"
  echo "  -o: GitHub repository owner (zorunlu)"
  echo "  -m: Mod (dev veya release) (zorunlu)"
  echo "  -b: Build numarası (dev modunda zorunlu)"
  echo "  -v: Versiyon (release modunda zorunlu)"
  exit 1
}

handle_error() {
  echo "❌ Hata: İşlem başarısız! Script sonlandırılıyor."
  exit 1
}

trap 'handle_error' ERR

while getopts "o:b:v:m:" opt; do
  case $opt in
    o) GITHUB_REPO_OWNER="$OPTARG" ;;
    b) BUILD_NUM="$OPTARG" ;;
    v) VERSION="$OPTARG" ;;
    m) MODE="$OPTARG" ;;
    *) echo "Geçersiz seçenek: -$OPTARG" >&2; usage ;;
  esac
done

if [ -z "$GITHUB_REPO_OWNER" ] || [ -z "$MODE" ]; then
  echo "Hata: Repository owner (-o) ve mod (-m) parametreleri zorunludur!"
  usage
fi

if [ "$MODE" != "dev" ] && [ "$MODE" != "release" ]; then
  echo "Hata: MODE parametresi sadece 'dev' veya 'release' olabilir."
  usage
fi

if [ "$MODE" = "dev" ] && [ -z "$BUILD_NUM" ]; then
  echo "Hata: Dev modunda build numarası (-b) zorunludur!"
  usage
elif [ "$MODE" = "release" ] && [ -z "$VERSION" ]; then
  echo "Hata: Release modunda version (-v) zorunludur!"
  usage
fi

echo "🔨 Building API image..."
docker build -t temp-api-image ./trac-portal-api

echo "🔨 Building UI image..."
docker build -t temp-ui-image ./trac-portal-ui

if [ "$MODE" = "dev" ]; then
  echo "🏷️ Tagging images with dev tags..."
  docker tag temp-api-image ghcr.io/$GITHUB_REPO_OWNER/trac-portal-api:dev-build.$BUILD_NUM
  docker tag temp-api-image ghcr.io/$GITHUB_REPO_OWNER/trac-portal-api:dev
  docker tag temp-ui-image ghcr.io/$GITHUB_REPO_OWNER/trac-portal-ui:dev-build.$BUILD_NUM
  docker tag temp-ui-image ghcr.io/$GITHUB_REPO_OWNER/trac-portal-ui:dev
  echo "👌 Dev images tagged successfully!"
  
  echo "🚀 Pushing dev images to GHCR..."
  docker push ghcr.io/$GITHUB_REPO_OWNER/trac-portal-api:dev-build.$BUILD_NUM
  docker push ghcr.io/$GITHUB_REPO_OWNER/trac-portal-api:dev
  docker push ghcr.io/$GITHUB_REPO_OWNER/trac-portal-ui:dev-build.$BUILD_NUM
  docker push ghcr.io/$GITHUB_REPO_OWNER/trac-portal-ui:dev
  echo "👌 Dev images pushed to GHCR successfully!"
else
  echo "🏷️ Tagging images with release tags..."
  docker tag temp-api-image ghcr.io/$GITHUB_REPO_OWNER/trac-portal-api:$VERSION
  docker tag temp-api-image ghcr.io/$GITHUB_REPO_OWNER/trac-portal-api:latest
  docker tag temp-ui-image ghcr.io/$GITHUB_REPO_OWNER/trac-portal-ui:$VERSION
  docker tag temp-ui-image ghcr.io/$GITHUB_REPO_OWNER/trac-portal-ui:latest
  echo "👌 Release images tagged successfully!"

  echo "🚀 Pushing release images to GHCR..."
  docker push ghcr.io/$GITHUB_REPO_OWNER/trac-portal-api:$VERSION
  docker push ghcr.io/$GITHUB_REPO_OWNER/trac-portal-api:latest
  docker push ghcr.io/$GITHUB_REPO_OWNER/trac-portal-ui:$VERSION
  docker push ghcr.io/$GITHUB_REPO_OWNER/trac-portal-ui:latest
  echo "👌 Release images pushed to GHCR successfully!"
fi

echo "✅ Build and push completed successfully!"
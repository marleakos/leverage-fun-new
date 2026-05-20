FROM rust:1.75.0-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    pkg-config \
    libssl-dev \
    libudev-dev \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install Solana CLI
RUN wget -q --no-check-certificate -L https://github.com/solana-labs/solana/releases/download/v1.17.0/solana-release-x86_64-unknown-linux-gnu.tar.bz2 && \
    tar -xjf solana-release-x86_64-unknown-linux-gnu.tar.bz2 && \
    mv solana-release /usr/local/solana && \
    rm solana-release-x86_64-unknown-linux-gnu.tar.bz2
ENV PATH="/usr/local/solana/bin:$PATH"

# Set working directory
WORKDIR /workspace

# Copy project files
COPY . .

# Build the program using cargo build-sbf
CMD ["cargo", "build-sbf"]

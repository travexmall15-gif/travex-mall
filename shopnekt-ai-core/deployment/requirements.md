# ShopNekt Local Model Runtime - Deployment Requirements

## Overview

This document describes the infrastructure requirements for deploying ShopNekt's local AI model runtime on private infrastructure. The goal is to enable ShopNekt to run its AI system without dependency on external AI APIs.

## Architecture Levels

### Level 1: Development Setup

For local development and testing without actual model weights.

**Requirements:**
- CPU: 4+ cores
- RAM: 8GB minimum, 16GB recommended
- Storage: 50GB SSD
- GPU: Not required (uses mock runtime)
- OS: Linux, macOS, or Windows with WSL2

**Purpose:**
- AI Core development
- Integration testing
- Unit tests with mock responses
- Prototype demonstrations

---

### Level 2: Single Developer Workstation

For running small models locally during development.

**Minimum Configuration:**
- CPU: 8+ cores (AMD Ryzen 7 / Intel i7 or equivalent)
- RAM: 32GB DDR4/DDR5
- Storage: 500GB NVMe SSD
- GPU: Optional (NVIDIA RTX 3060 12GB or better)
- VRAM: 8GB minimum if using GPU
- OS: Linux (Ubuntu 22.04+) recommended

**Recommended Configuration:**
- CPU: 12+ cores (AMD Ryzen 9 / Intel i9)
- RAM: 64GB DDR5
- Storage: 1TB NVMe SSD
- GPU: NVIDIA RTX 4090 24GB or RTX 3090 24GB
- VRAM: 24GB
- OS: Ubuntu 22.04 LTS

**Models Supported:**
- 7B parameter models (quantized): CPU-only inference
- 13B parameter models (quantized): GPU-accelerated
- 70B parameter models (heavily quantized): High-end GPU required

---

### Level 3: Dedicated AI Server (Production)

For production deployment serving ShopNekt users.

**Minimum Production:**
- CPU: 16+ cores (AMD EPYC / Intel Xeon)
- RAM: 128GB ECC
- Storage: 2TB NVMe SSD (RAID 1)
- GPU: 2× NVIDIA A10G 24GB or 1× A100 40GB
- VRAM: 48GB total minimum
- Network: 10 Gbps
- PSU: 1000W+ redundant

**Recommended Production:**
- CPU: 32+ cores (AMD EPYC 7003 series / Intel Xeon Gold)
- RAM: 256GB ECC DDR4/DDR5
- Storage: 4TB NVMe SSD (RAID 10)
- GPU: 2× NVIDIA A100 80GB or 4× A10G 24GB
- VRAM: 160GB+ total
- Network: 25 Gbps
- PSU: 1600W+ redundant platinum-rated
- Cooling: Liquid cooling recommended for multi-GPU

**Models Supported:**
- 7B-13B parameter models: Multiple concurrent instances
- 70B parameter models: Single instance with high throughput
- Context length: Up to 32K tokens

---

### Level 4: High-Concurrency Infrastructure

For scaling to thousands of concurrent users.

**Configuration:**
- Multiple AI servers (3+ nodes)
- Load balancer (HAProxy / NGINX / custom)
- Shared storage for models (NFS / Ceph)
- Kubernetes or Docker Swarm orchestration
- Monitoring stack (Prometheus + Grafana)

**Per Node:**
- Same as Recommended Production above
- Interconnect: InfiniBand or 100 Gbps Ethernet

**Total Capacity:**
- 1000+ requests per second
- Sub-100ms p95 latency
- 99.9% uptime SLA

---

## Runtime Engine Options

### Option 1: llama.cpp

**Pros:**
- CPU and GPU support
- Excellent quantization (GGUF format)
- Low memory footprint
- Active development
- Commercial-friendly license (MIT)

**Cons:**
- Lower throughput than vLLM
- Manual scaling required

**Best For:**
- Development workstations
- Small-to-medium production deployments
- Cost-sensitive deployments

**Installation:**
```bash
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make -j
```

---

### Option 2: vLLM

**Pros:**
- Highest throughput for GPU inference
- PagedAttention optimization
- Continuous batching
- OpenAI-compatible API
- Apache 2.0 license

**Cons:**
- GPU-only (CUDA)
- Higher VRAM requirements
- More complex setup

**Best For:**
- High-concurrency production
- Large context windows
- Maximum throughput requirements

**Installation:**
```bash
pip install vllm
```

---

### Option 3: Ollama

**Pros:**
- Simplest setup
- Model management built-in
- Good for development
- Active community

**Cons:**
- Less optimized for production
- Limited customization
- Additional abstraction layer

**Best For:**
- Rapid prototyping
- Development environments
- Small-scale deployments

**Installation:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

---

## Model Selection Criteria

### Language Capabilities

**Required:**
- Strong Swahili performance (primary market language)
- Strong English performance
- Mixed-language understanding (Swahili-English code-switching)
- Informal language comprehension
- Spelling variation tolerance

**Evaluation Metrics:**
- BLEU score for translation tasks
- ROUGE-L for summarization
- Custom ShopNekt intent accuracy
- Entity extraction F1 score

---

### Technical Requirements

**Context Window:**
- Minimum: 8K tokens
- Recommended: 32K tokens
- Ideal: 128K tokens (for complex conversations)

**Parameter Count:**
- Development: 7B-13B
- Production: 13B-70B
- High-end: 70B+

**Quantization Support:**
- INT4 quantization (essential for resource efficiency)
- INT8 quantization
- FP16 for highest quality

**Inference Speed:**
- Target: 30+ tokens/second (single user)
- Target: 100+ tokens/second (batched production)

---

### Licensing Requirements

**Must Have:**
- Commercial use permitted
- No royalty requirements
- Modification allowed for fine-tuning
- Distribution of derived works allowed (for internal use)

**Preferred Licenses:**
- Apache 2.0
- MIT
- Llama 2/3 Community License
- OpenRAIL variants

**Avoid:**
- GPL/AGPL (copyleft concerns)
- Non-commercial licenses
- Research-only licenses

---

### Recommended Model Candidates (To Be Evaluated)

**Note:** Actual model selection requires benchmarking with ShopNekt-specific datasets.

**Tier 1 (7B-13B):**
- Llama 3 8B Instruct
- Mistral 7B Instruct
- Qwen2.5 7B/14B Instruct
- Gemma 2 9B

**Tier 2 (30B-70B):**
- Llama 3 70B Instruct
- Qwen2.5 72B Instruct
- Mixtral 8x22B

**Evaluation Process:**
1. Download candidate models
2. Run ShopNekt benchmark suite
3. Measure intent accuracy, entity extraction, language understanding
4. Evaluate hardware requirements
5. Select best price/performance ratio

---

## Security Considerations

### Network Isolation

**Production Deployment:**
- AI server on private network segment
- No direct internet access
- Access only through ShopNekt application gateway
- Firewall rules restricting inbound traffic

### Data Protection

- Model weights stored on encrypted storage
- No user data persisted in model memory longer than session
- Secure deletion of temporary files
- Regular security audits

### Access Control

- API authentication required
- Rate limiting per user/session
- Audit logging for all requests
- No direct shell access to production servers

---

## Monitoring & Observability

### Required Metrics

**Model Performance:**
- Tokens generated per second
- Request latency (p50, p95, p99)
- Queue depth
- Error rate by error type

**Hardware Health:**
- GPU utilization
- GPU temperature
- Memory usage
- Disk I/O

**Business Metrics:**
- Requests per minute
- Active sessions
- Intent distribution
- User satisfaction (indirect)

### Alerting Thresholds

- Latency p95 > 500ms: Warning
- Latency p95 > 2000ms: Critical
- Error rate > 1%: Warning
- Error rate > 5%: Critical
- GPU temperature > 85°C: Warning
- GPU temperature > 90°C: Critical

---

## Backup & Recovery

### Model Weights

- Store original model files in versioned storage
- Maintain checksums for integrity verification
- Keep at least 2 backup copies in different locations
- Document restoration procedure

### Configuration

- Version control all configuration files
- Automated backup of runtime configurations
- Disaster recovery playbook

### Recovery Time Objectives

- RTO (Recovery Time Objective): < 4 hours
- RPO (Recovery Point Objective): < 1 hour

---

## Cost Estimates (Approximate)

### Development Workstation

- Hardware: $2,000 - $5,000 one-time
- Electricity: ~$50/month
- Maintenance: Minimal

### Production Server (Single Node)

- Hardware: $15,000 - $50,000 one-time
- Or Cloud: $3,000 - $10,000/month (equivalent cloud instances)
- Electricity: ~$200-500/month
- Maintenance: ~$500/month

### High-Concurrency Cluster (3 nodes)

- Hardware: $100,000 - $200,000 one-time
- Or Cloud: $15,000 - $30,000/month
- Electricity: ~$1,000-2,000/month
- Maintenance: ~$2,000/month

**Note:** Costs vary significantly by region, vendor, and specific requirements.

---

## Next Steps

1. **Benchmark Phase** (2-4 weeks)
   - Set up evaluation framework
   - Test candidate models
   - Document performance characteristics

2. **Pilot Deployment** (2-4 weeks)
   - Deploy selected model on test server
   - Integrate with ShopNekt AI Core
   - Run integration tests

3. **Production Rollout** (4-8 weeks)
   - Gradual traffic migration
   - Monitor performance metrics
   - Optimize configuration

4. **Continuous Improvement**
   - Regular model evaluation
   - Fine-tuning with ShopNekt data
   - Hardware upgrades as needed

---

## Contact & Support

For questions about deployment requirements:
- Review: `/deployment/architecture.md`
- Model benchmarks: `/evaluation/model-benchmarks/`
- Runtime configuration: `/model/model-config.ts`

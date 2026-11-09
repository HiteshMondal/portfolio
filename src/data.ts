export type Proj = { name: string; when: string; repo: string; stack: string[]; stats: [string, string][]; pts: string[] };
export type Ach = { n: number | null; s: string; t: string; src: string };

export const P = {
  name: "Hitesh Mondal", email: "mehiteshmondal@gmail.com", phone: "+91 8584929519", tel: "+918584929519",
  loc: "Gachibowli, Hyderabad, Telangana, India", perm: "Barrackpore, North 24 Parganas, West Bengal",
  gh: "https://github.com/HiteshMondal", li: "https://www.linkedin.com/in/hitesh-mondal-1ba04a317", lc: "https://leetcode.com/u/hiteshmondal",
};
export const ROLES = ["Cloud Computing", "DevOps", "Platform Engineering", "Linux Administration"];
export const SUMMARY = [
  "I’m an aspiring IT engineer with a strong interest in Cloud Computing, DevOps, Platform Engineering and Linux Administration, backed by core computer science: DSA, OOP, DBMS, Computer Networks and System Design.",
  "As a fresher, I believe in continuous learning and practical problem-solving. I’ve completed hands-on labs and troubleshooting scenarios, and built projects in DevOps, cloud infrastructure and Linux administration to apply what I learn to real problems.",
  "I’m a quick learner who enjoys understanding technical challenges and finding effective solutions. I’m looking forward to starting my career, learning from experienced engineers and contributing to my team.",
];
export const SKILLS: [string, string[]][] = [
  ["Languages", ["Python", "Bash/Shell Scripting", "JavaScript/TypeScript", "SQL"]],
  ["Systems & Architecture", ["Data Structures and Algorithms (DSA)", "Object-Oriented Programming", "Database Management Systems (DBMS)", "Computer Networks", "Operating Systems", "System Design"]],
  ["Technologies & Tools", ["AWS", "Azure", "Linux", "Git", "Docker", "Kubernetes", "Terraform", "Pulumi", "CI/CD", "GitOps", "GitHub Actions", "GitLab", "Jenkins", "Argo CD", "FastAPI", "REST APIs", "PostgreSQL", "MongoDB", "Redis", "Jira"]],
];
export const JOB = {
  role: "AWS DevOps Intern", org: "SmartBridge", place: "Hyderabad, Telangana", when: "Nov 2026 – Present",
  pts: [
    "Tested the company’s AWS platform and infrastructure to identify issues and evaluate system performance.",
    "Upskilled in Python, AWS and Linux.",
    "Ran knowledge-transfer sessions and communicated AWS infrastructure requirements to the relevant teams.",
    "Analyzed the company’s business logic, infrastructure platform and server environment.",
  ],
};
export const PROJ: Proj[] = [
  {
    name: "Automated Cloud Delivery & Infrastructure Provisioning Platform", when: "Jul 2025 – Present", repo: "github.com/HiteshMondal/devops",
    stack: ["Python", "Bash", "Docker", "Kubernetes", "Helm", "Kustomize", "KEDA", "Terraform", "Pulumi", "AWS", "Azure", "Argo CD", "Prometheus", "Grafana", "Loki", "Trivy"],
    stats: [["2–10", "HPA replicas"], ["14", "pipeline stages"], ["25+", "dashboard panels"], ["20+", "images scanned"]],
    pts: [
      "Built a production-ready Python and Bash deployment orchestrator for local and cloud environments, automating the infrastructure lifecycle, runtime detection, debugging, inspection and Kubernetes deployments.",
      "Containerized and orchestrated a full-stack app with Docker, Kustomize and Helm; Kubernetes HPA scales it from 2–10 replicas and KEDA handles event-driven autoscaling.",
      "Provisioned self-healing, disaster recovery, storage, monitoring and serverless infrastructure across AWS and Azure with Terraform, Pulumi and Python, deploying EKS, AKS and managed PostgreSQL.",
      "Built multi-stage GitOps pipelines with GitHub Actions, GitLab CI, Jenkins and Argo CD, automating tests, container builds, security scans, infra lifecycle, Kubernetes validation and branch checks across 10 jobs and 14 stages.",
      "Developed an observability stack with Prometheus, Grafana and Loki (25+ panels, 10+ alerts) and integrated Trivy into CI/CD to scan 20+ container images for critical vulnerabilities.",
    ],
  },
  {
    name: "System Security & Network Analysis Toolkit", when: "Aug 2025 – Present", repo: "github.com/HiteshMondal/networking_cybersecurity",
    stack: ["Linux", "Bash", "iptables / UFW", "auditd", "Nmap", "tcpdump", "TShark", "YARA", "dig", "WHOIS", "ss / lsof"],
    stats: [["5", "hardening areas"], ["8+", "recon tools"], ["Live", "GUI dashboard"]],
    pts: [
      "Developed a modular Linux cybersecurity and network automation toolkit for system hardening, security monitoring, network diagnostics, threat detection, troubleshooting and forensic data collection.",
      "Automated security auditing and hardening with sysctl kernel parameters, iptables/UFW rules, auditd monitoring, SUID/SGID and world-writable file audits, and journal/log integrity checks.",
      "Implemented reconnaissance and suspicious-activity detection: DNS analysis, socket correlation, packet capture and malware/C2 detection with Nmap, dig, WHOIS, ss, lsof, tcpdump, TShark and YARA.",
      "Built a real-time GUI dashboard for security and network telemetry, with automated report generation and email/social media sharing.",
    ],
  },
];
export const ACH: Ach[] = [
  { n: 110, s: "+", t: "DSA problems solved", src: "LeetCode" },
  { n: 30, s: "+", t: "SQL problems solved", src: "LeetCode" },
  { n: 40, s: "+", t: "Shell scripting challenges", src: "HackerRank" },
  { n: 75, s: "+", t: "Linux, Docker, Kubernetes, infra and CI/CD labs", src: "Killercoda, KodeKloud, SADServers" },
  { n: null, s: "All", t: "Bandit levels cleared: Linux admin and shell scripting", src: "OverTheWire" },
  { n: 20, s: "+", t: "Exams passed in Python, Linux, Network Support and ITSM", src: "Vskills" },
];
export const EDU = [
  ["B.Tech. in Computer Science and Engineering", "JIS College of Engineering, Kalyani, West Bengal", "CGPA 7.5/10 · Aug 2022 – Jul 2026"],
  ["Higher Secondary (Class XII), Science: PCBM", "Central Model School, Barrackpore, West Bengal", "70% · Jul 2021 – Jul 2022"],
];
export const CERTS: [string, string][] = [
  ["AWS Cloud Practitioner Essentials", "Jul 2025"], ["Advanced Testing Practices Using AWS DevOps Tools", "Jul 2025"],
  ["Cisco Linux Unhatched", "Jul 2026"], ["Coursera Data Structures", "Jan 2024"],
];
export const LANGS = "Hindi (native), Bengali (native), English (professional)";
export const HOBBIES = "Drummer, learning about different cultures and people, gaming";

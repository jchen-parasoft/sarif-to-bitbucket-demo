# Sarif to BitBucket Demo

## Getting Started
BitBucket Configuration:

Create Repository Variables `BB_USER` and `BB_APP_PASSWORD` corresponding to a username / app password with BitBucket API access

## Usage in BitBucket Pipeline
```
image: atlassian/default-image:3

pipelines:
  pull-requests:
    '**': # any source branch 
      - step:
          name: "Use sarif-to-bitbucket-demo to upload sarif report to Bitbuckets"
          script:
            - git clone https://github.com/jchen-parasoft/sarif-to-bitbucket-demo.git
            - cd sarif-to-bitbucket-demo
            - git checkout convert_to_ts
            - npm install
            - node dist/index.js --username $BB_USER --password $BB_APP_PASSWORD --repo $BITBUCKET_REPO_SLUG --commit $BITBUCKET_COMMIT --workspace $BITBUCKET_WORKSPACE --report "example_reports/jtest-example.sarif"
```

## Parameters
| Input       | Description                                |
|-------------|--------------------------------------------|
| `user`      | The username for BitBucket API access.     |
| `password`  | The app password for BitBucket API access. |
| `repo`      | The Bitbucket repository name.             |
| `commit`    | The commit hash code for the repository.   |
| `workspace` | The Bitbucket workspace name.              |
| `report`    | Path to locate sarif report files.         |

## Reports in BitBucket Pipeline
<img width="650" src="assets/example_result.png" alt="example report result">
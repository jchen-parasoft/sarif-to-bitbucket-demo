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
            - npm i -g github:jchen-parasoft/sarif-to-bitbucket-demo
            - sarif-to-bb --report "path/to/report"
```

## Parameters
| Input       | Description                                |
|-------------|--------------------------------------------|
| `report`    | Path to locate sarif report files.         |

## Reports in BitBucket Pipeline
<img width="650" src="assets/example_result.png" alt="example report result">
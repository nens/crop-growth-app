# crop-growth-app

_A minimal report generator for crop growth in Vietnam._

Deployment
==========

For the deployment of frontend repositories we make use of the client
deployment repository https://github.com/nens/client-deployment. It is already
included as a git submodule in this repo.

Init the git submodule if you haven't done `clone --recursive`  or ran this command earlier:

```sh
git submodule init
```

To update the git submodule:

```sh
git pull --recurse-submodules
git submodule update --remote
```

Uses Ansible for deployment.

Ansible requires:

- the file `deploy/hosts` which can be created from `deploy.hosts.example` by filling out the server names. But it is best is to ask a collegue for this file.
- the file `deploy/production_hosts` which can be created from `deploy/production_hosts.example` by filling out the server names. But it is best is to ask a collegue for this file.
- the file `deploy/group_vars/all` which can be created from `deploy/group_vars/all.example` by filling each line with the correct value. But best is to ask a collegue for this file.

Ansible requires you to set a public ssh key on the remote server. Run the following command to send your public key to the server:

```sh
ssh-copy-id <USERNAME>@<SERVER_NAME>
```

Now deploy for staging:

```sh
npm run staging-deploy
```

Or deploy for production:

```sh
npm run production-deploy
```


_NOTE: When ansible complains about permissions this may be because the owners for some files were changed to `root`, where this should be `buildout`. In this case use ssh to connect to the server and navigate to the folder of the deployment path. Then change the owner of the `dist/` folder to buildout: ```chown -R buildout:buildout /dist```._


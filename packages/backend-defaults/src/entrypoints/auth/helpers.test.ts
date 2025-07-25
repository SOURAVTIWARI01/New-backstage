/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  createCredentialsWithNonePrincipal,
  createCredentialsWithServicePrincipal,
  createCredentialsWithUserPrincipal,
} from './helpers';

describe('credentials', () => {
  it('should be created', () => {
    expect(createCredentialsWithServicePrincipal('my-service')).toEqual({
      $$type: '@backstage/BackstageCredentials',
      version: 'v1',
      principal: {
        type: 'service',
        subject: 'my-service',
      },
    });

    expect(
      createCredentialsWithUserPrincipal('user:default/mock', 'my-token'),
    ).toEqual({
      $$type: '@backstage/BackstageCredentials',
      version: 'v1',
      principal: {
        type: 'user',
        userEntityRef: 'user:default/mock',
      },
    });

    expect(
      createCredentialsWithUserPrincipal(
        'user:default/mock',
        'my-token',
        undefined,
        'my-actor',
      ),
    ).toEqual({
      $$type: '@backstage/BackstageCredentials',
      version: 'v1',
      principal: {
        type: 'user',
        userEntityRef: 'user:default/mock',
        actor: { type: 'service', subject: 'my-actor' },
      },
    });

    expect(createCredentialsWithNonePrincipal()).toEqual({
      $$type: '@backstage/BackstageCredentials',
      version: 'v1',
      principal: {
        type: 'none',
      },
    });
  });

  it('should not include tokens when serialized', () => {
    expect(
      JSON.stringify(
        createCredentialsWithServicePrincipal('my-service', 'my-token'),
      ),
    ).not.toMatch(/my-token/);

    expect(
      JSON.stringify(
        createCredentialsWithUserPrincipal('user:default/mock', 'my-token'),
      ),
    ).not.toMatch(/my-token/);
  });

  it('should have a serializable form both as strings and as JSON', () => {
    const simpleService = createCredentialsWithServicePrincipal('my-service');
    expect(String(simpleService)).toMatchInlineSnapshot(
      `"backstageCredentials{servicePrincipal{my-service}}"`,
    );
    expect(JSON.stringify(simpleService)).toMatchInlineSnapshot(
      `"{"$$type":"@backstage/BackstageCredentials","version":"v1","principal":{"type":"service","subject":"my-service"}}"`,
    );

    const serviceWithAccessRestrictions = createCredentialsWithServicePrincipal(
      'my-service',
      undefined,
      {
        permissionNames: ['perm'],
        permissionAttributes: {
          action: ['read'],
        },
      },
    );
    expect(String(serviceWithAccessRestrictions)).toMatchInlineSnapshot(
      `"backstageCredentials{servicePrincipal{my-service,accessRestrictions=cXWOJgUirHkHNZIowUi/YO5nwEwhTicC38iXi2XTYCk}}"`,
    );
    expect(JSON.stringify(serviceWithAccessRestrictions)).toMatchInlineSnapshot(
      `"{"$$type":"@backstage/BackstageCredentials","version":"v1","principal":{"type":"service","subject":"my-service","accessRestrictions":{"permissionNames":["perm"],"permissionAttributes":{"action":["read"]}}}}"`,
    );

    const simpleUser = createCredentialsWithUserPrincipal(
      'user:default/mock',
      'my-token',
    );
    expect(String(simpleUser)).toMatchInlineSnapshot(
      `"backstageCredentials{userPrincipal{user:default/mock}}"`,
    );
    expect(JSON.stringify(simpleUser)).toMatchInlineSnapshot(
      `"{"$$type":"@backstage/BackstageCredentials","version":"v1","principal":{"type":"user","userEntityRef":"user:default/mock"}}"`,
    );

    const userWithActor = createCredentialsWithUserPrincipal(
      'user:default/mock',
      'my-token',
      undefined,
      'my-actor',
    );
    expect(String(userWithActor)).toMatchInlineSnapshot(
      `"backstageCredentials{userPrincipal{user:default/mock,actor={servicePrincipal{my-actor}}}}"`,
    );
    expect(JSON.stringify(userWithActor)).toMatchInlineSnapshot(
      `"{"$$type":"@backstage/BackstageCredentials","version":"v1","principal":{"type":"user","userEntityRef":"user:default/mock","actor":{"type":"service","subject":"my-actor"}}}"`,
    );

    const none = createCredentialsWithNonePrincipal();
    expect(String(none)).toMatchInlineSnapshot(
      `"backstageCredentials{nonePrincipal}"`,
    );
    expect(JSON.stringify(none)).toMatchInlineSnapshot(
      `"{"$$type":"@backstage/BackstageCredentials","version":"v1","principal":{"type":"none"}}"`,
    );
  });
});

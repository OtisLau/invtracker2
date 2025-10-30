import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Banner,
  Box,
  Button,
  Card,
  FormLayout,
  Link,
  Page,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";

import { getCsrfToken } from "../utils/products.js";

export default function SignUpPage({
  registrationPath,
  sessionPath,
  stores,
  errors,
  alert: initialAlert,
  notice: initialNotice,
  initialName,
  initialEmail,
  initialStoreId,
}) {
  const [name, setName] = useState(initialName ?? "");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [storeId, setStoreId] = useState(initialStoreId ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(initialAlert ?? "");
  const [notice, setNotice] = useState(initialNotice ?? "");

  const csrfToken = useMemo(() => getCsrfToken(), []);

  useEffect(() => {
    if (!alert) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setAlert("");
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [alert]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setNotice("");
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const handleSubmit = useCallback(() => {
    setSubmitting(true);
  }, []);

  const storeOptions = useMemo(() => {
    const options = [
      {
        label: "Select a store",
        value: "",
      },
    ];

    for (const store of stores ?? []) {
      options.push({
        label: store.name,
        value: String(store.id),
      });
    }

    return options;
  }, [stores]);

  const fieldErrors = useMemo(() => {
    if (!errors) {
      return {};
    }

    return {
      name: errors.name?.[0],
      email: errors.email?.[0],
      password: errors.password?.[0],
      passwordConfirmation:
        errors.password_confirmation?.[0] ?? errors["password confirmation"]?.[0],
      store:
        errors.store_id?.[0] ??
        errors.store?.[0] ??
        errors["store id"]?.[0],
      base: errors.base ?? [],
    };
  }, [errors]);

  const errorMessages = useMemo(() => {
    if (!errors) {
      return [];
    }

    const unique = new Set();

    for (const messages of Object.values(errors)) {
      if (!Array.isArray(messages)) {
        continue;
      }

      for (const message of messages) {
        unique.add(message);
      }
    }

    return Array.from(unique);
  }, [errors]);

  return (
    <Box minHeight="100vh" background="bg-surface-secondary">
      <Box
        display="flex"
        align="center"
        justifyContent="center"
        paddingBlockStart="2000"
        paddingBlockEnd="400"
        paddingInline="600"
      >
        <Page narrowWidth paddingBlockEnd="800">
          <Box paddingBlockStart="400" maxWidth="400px" width="100%">
            <Box paddingBlockEnd="400" textAlign="center">
              <Text as="h1" variant="headingLg">
                Create your InvTracker account
              </Text>
            </Box>
            {alert ? (
              <Box paddingBlockEnd="400">
                <Banner tone="critical" onDismiss={() => setAlert("")}>
                  {alert}
                </Banner>
              </Box>
            ) : null}
            {notice ? (
              <Box paddingBlockEnd="400">
                <Banner tone="success" onDismiss={() => setNotice("")}>
                  {notice}
                </Banner>
              </Box>
            ) : null}
            {errorMessages.length > 0 ? (
              <Box paddingBlockEnd="400">
                <Banner tone="critical">
                  <Box as="ul" paddingInlineStart="400" marginBlock="0">
                    {errorMessages.map((message) => (
                      <Box as="li" key={message}>
                        {message}
                      </Box>
                    ))}
                  </Box>
                </Banner>
              </Box>
            ) : null}
            <Card>
              <Box padding="400">
                <form action={registrationPath} method="post" onSubmit={handleSubmit}>
                  <input type="hidden" name="authenticity_token" value={csrfToken} />
                  <FormLayout>
                    <TextField
                      label="Name (optional)"
                      autoComplete="given-name"
                      value={name}
                      onChange={setName}
                      name="user[name]"
                      error={fieldErrors.name}
                    />
                    <TextField
                      label="Email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={setEmail}
                      name="user[email]"
                      requiredIndicator
                      error={fieldErrors.email}
                    />
                    <TextField
                      label="Password"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={setPassword}
                      name="user[password]"
                      requiredIndicator
                      error={fieldErrors.password}
                    />
                    <TextField
                      label="Confirm password"
                      type="password"
                      autoComplete="new-password"
                      value={passwordConfirmation}
                      onChange={setPasswordConfirmation}
                      name="user[password_confirmation]"
                      requiredIndicator
                      error={fieldErrors.passwordConfirmation}
                    />
                    <Select
                      label="Store"
                      options={storeOptions}
                      value={storeId ?? ""}
                      onChange={setStoreId}
                      name="user[store_id]"
                      placeholder="Select a store"
                      error={fieldErrors.store}
                    />
                    {stores?.length === 0 ? (
                      <Text as="p" variant="bodySm" tone="subdued">
                        No stores available yet. Please contact an administrator.
                      </Text>
                    ) : null}
                    <Text as="p" variant="bodySm">
                      Your account will be created with standard employee access.
                    </Text>
                    <Button submit variant="primary" fullWidth loading={submitting}>
                      Create account
                    </Button>
                  </FormLayout>
                </form>
              </Box>
            </Card>
            <Box paddingBlockStart="400" textAlign="center">
              <Text as="p" variant="bodyMd">
                Already have an account? <Link url={sessionPath}>Sign in</Link>
              </Text>
            </Box>
          </Box>
        </Page>
      </Box>
    </Box>
  );
}

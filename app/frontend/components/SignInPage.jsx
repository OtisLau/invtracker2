import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Banner,
  Box,
  Button,
  Card,
  FormLayout,
  Link,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";

import { getCsrfToken } from "../utils/products.js";

export default function SignInPage({
  loginPath,
  registrationPath,
  alert: initialAlert,
  notice: initialNotice,
  initialEmail,
}) {
  const [email, setEmail] = useState(initialEmail ?? "");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(initialAlert ?? "");
  const [notice, setNotice] = useState(initialNotice ?? "");

  const csrfToken = useMemo(() => getCsrfToken(), []); //this is that csrf token that we need to stop cross site request forgry

  useEffect(() => {
    if (!alert) {
      return;
    }

    const timeoutId = window.setTimeout(() => { // this is the function that is called when the alert is set and it will make the banner disappear after 3 seconds
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

  const handleEmailChange = useCallback((value) => {
    setEmail(value);
  }, []);

  const handlePasswordChange = useCallback((value) => {
    setPassword(value);
  }, []);

  const handleSubmit = useCallback(() => {
    setSubmitting(true);
  }, []);

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
                InvTracker sign in
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
            <Card>
              <Box padding="400">
                <form action={loginPath} method="post" onSubmit={handleSubmit}>
                  <input type="hidden" name="authenticity_token" value={csrfToken} />
                  <FormLayout>
                    <TextField
                      label="Email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={handleEmailChange}
                      name="email"
                      requiredIndicator
                      autoFocus
                    />
                    <TextField
                      label="Password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={handlePasswordChange}
                      name="password"
                      requiredIndicator
                    />
                    <Button submit variant="primary" fullWidth loading={submitting}>
                      Sign in
                    </Button>
                  </FormLayout>
                </form>
              </Box>
            </Card>
            <Box paddingBlockStart="400" textAlign="center">
              <Text as="p" variant="bodyMd">
                Need an account? <Link url={registrationPath}>Create one</Link>
              </Text>
            </Box>
          </Box>
        </Page>
      </Box>
    </Box>
  );
}

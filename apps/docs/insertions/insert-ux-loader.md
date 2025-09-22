# Ux Loader

Soon. (In october)

- [x] Creating a dedicated reusable utility function
- [x] Creating test
- [] Creating insertUxLoader
- [] Creating test of insertUxLoader

## Aim

Use it to avoid _flickering_.

- If the data is loaded is very fast, the loader will not be shown.
- If the data takes more than 300ms to be retrieved, the loader will be shown a minimum of 400ms
- If the data takes more than 300ms and still loading after 400ms (the minimum time to show the loader), it will still display the loader until the data is retrieved

# Android ARM64 16 KB Native Bundle

This directory contains prebuilt Android ARM64 native libraries for Deadlight projects.

These libraries were built and verified for Android 16 KB page-size compatibility. They are intended for reuse by Android builds of:

- deadlight-proxy
- deadmesh
- future native Deadlight components

The bundle includes GLib/json-glib-related runtime libraries, headers, and `libdeadlight.so`.

Use the verifier before updating this bundle:

```bash
./build/android/scripts/verify-elf-alignment.sh build/prebuilt/android-arm64-v8a-16kb/lib
```

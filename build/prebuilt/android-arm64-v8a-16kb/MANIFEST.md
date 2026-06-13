# Deadlight Android ARM64 16 KB Native Bundle

Generated: 2026-06-12T21:39:29Z
Source prefix: /home/thatch/platforms/android/android-out

## Verification

All staged shared libraries are verified with ELF LOAD alignment 0x4000.

## Libraries

### libdeadlight.so
build/prebuilt/android-arm64-v8a-16kb/lib/libdeadlight.so: ELF 64-bit LSB pie executable, ARM aarch64, version 1 (SYSV), dynamically linked, interpreter /system/bin/linker64, with debug_info, not stripped
3afd03f61b85d7b2197e64ff380744eb6ab69b61baf5bd2ec91a04a2a1a090e7  build/prebuilt/android-arm64-v8a-16kb/lib/libdeadlight.so

```
  LOAD           0x000000 0x0000000000000000 0x0000000000000000 0x200950 0x200950 R   0x4000
  LOAD           0x201000 0x0000000000205000 0x0000000000205000 0x28b020 0x28b020 R E 0x4000
  LOAD           0x48c020 0x0000000000494020 0x0000000000494020 0x05b958 0x05bfe0 RW  0x4000
  LOAD           0x4e7978 0x00000000004f3978 0x00000000004f3978 0x005c40 0x007d80 RW  0x4000
```

NEEDED:
```
 0x0000000000000001 (NEEDED)             Shared library: [libglib-2.0.so]
 0x0000000000000001 (NEEDED)             Shared library: [libgio-2.0.so]
 0x0000000000000001 (NEEDED)             Shared library: [libgobject-2.0.so]
 0x0000000000000001 (NEEDED)             Shared library: [libjson-glib-1.0.so]
 0x0000000000000001 (NEEDED)             Shared library: [libgmodule-2.0.so]
 0x0000000000000001 (NEEDED)             Shared library: [libm.so]
 0x0000000000000001 (NEEDED)             Shared library: [libdl.so]
 0x0000000000000001 (NEEDED)             Shared library: [libc.so]
```

### libffi.so
build/prebuilt/android-arm64-v8a-16kb/lib/libffi.so: ELF 64-bit LSB shared object, ARM aarch64, version 1 (SYSV), dynamically linked, with debug_info, not stripped
0221efe2dc5546529648121965f286198acd4ded8cbadbfd2bacd7fc492675ac  build/prebuilt/android-arm64-v8a-16kb/lib/libffi.so

```
  LOAD           0x000000 0x0000000000000000 0x0000000000000000 0x001d4c 0x001d4c R   0x4000
  LOAD           0x001d50 0x0000000000005d50 0x0000000000005d50 0x004210 0x004210 R E 0x4000
  LOAD           0x005f60 0x000000000000df60 0x000000000000df60 0x000318 0x0010a0 RW  0x4000
  LOAD           0x006278 0x0000000000012278 0x0000000000012278 0x000064 0x0004b0 RW  0x4000
```

NEEDED:
```
 0x0000000000000001 (NEEDED)             Shared library: [libc.so]
```

### libgio-2.0.so
build/prebuilt/android-arm64-v8a-16kb/lib/libgio-2.0.so: ELF 64-bit LSB shared object, ARM aarch64, version 1 (SYSV), dynamically linked, with debug_info, not stripped
78617ace3eca42c17362203926ece10b73ff96d93242cbbb253d6bb54ad5c79f  build/prebuilt/android-arm64-v8a-16kb/lib/libgio-2.0.so

```
  LOAD           0x000000 0x0000000000000000 0x0000000000000000 0x0bbe0c 0x0bbe0c R   0x4000
  LOAD           0x0bbe10 0x00000000000bfe10 0x00000000000bfe10 0x124130 0x124130 R E 0x4000
  LOAD           0x1dff40 0x00000000001e7f40 0x00000000001e7f40 0x008ab0 0x0090c0 RW  0x4000
  LOAD           0x1e89f0 0x00000000001f49f0 0x00000000001f49f0 0x0001e8 0x002100 RW  0x4000
```

NEEDED:
```
 0x0000000000000001 (NEEDED)             Shared library: [libglib-2.0.so]
 0x0000000000000001 (NEEDED)             Shared library: [libintl.so]
 0x0000000000000001 (NEEDED)             Shared library: [libgobject-2.0.so]
 0x0000000000000001 (NEEDED)             Shared library: [libgmodule-2.0.so]
 0x0000000000000001 (NEEDED)             Shared library: [libz.so]
 0x0000000000000001 (NEEDED)             Shared library: [libc.so]
```

### libgirepository-2.0.so
build/prebuilt/android-arm64-v8a-16kb/lib/libgirepository-2.0.so: ELF 64-bit LSB shared object, ARM aarch64, version 1 (SYSV), dynamically linked, with debug_info, not stripped
7ab21b6b7901b55ea9a7413565906d025fa0fc685b4c20b1f05b24c33617f289  build/prebuilt/android-arm64-v8a-16kb/lib/libgirepository-2.0.so

```
  LOAD           0x000000 0x0000000000000000 0x0000000000000000 0x015aec 0x015aec R   0x4000
  LOAD           0x015aec 0x0000000000019aec 0x0000000000019aec 0x0211e4 0x0211e4 R E 0x4000
  LOAD           0x036cd0 0x000000000003ecd0 0x000000000003ecd0 0x000d00 0x001330 RW  0x4000
  LOAD           0x0379d0 0x00000000000439d0 0x00000000000439d0 0x000060 0x000154 RW  0x4000
```

NEEDED:
```
 0x0000000000000001 (NEEDED)             Shared library: [libglib-2.0.so]
 0x0000000000000001 (NEEDED)             Shared library: [libgobject-2.0.so]
 0x0000000000000001 (NEEDED)             Shared library: [libgmodule-2.0.so]
 0x0000000000000001 (NEEDED)             Shared library: [libffi.so]
 0x0000000000000001 (NEEDED)             Shared library: [libm.so]
 0x0000000000000001 (NEEDED)             Shared library: [libc.so]
```

### libglib-2.0.so
build/prebuilt/android-arm64-v8a-16kb/lib/libglib-2.0.so: ELF 64-bit LSB shared object, ARM aarch64, version 1 (SYSV), dynamically linked, with debug_info, not stripped
0bbcea7c08035aa9d00a075bdcbf2ce95131fa4650d604c0e44abc91a8d169a5  build/prebuilt/android-arm64-v8a-16kb/lib/libglib-2.0.so

```
  LOAD           0x000000 0x0000000000000000 0x0000000000000000 0x1963bc 0x1963bc R   0x4000
  LOAD           0x1963c0 0x000000000019a3c0 0x000000000019a3c0 0x0d9100 0x0d9100 R E 0x4000
  LOAD           0x26f4c0 0x00000000002774c0 0x00000000002774c0 0x0021e0 0x002b40 RW  0x4000
  LOAD           0x2716a0 0x000000000027d6a0 0x000000000027d6a0 0x000488 0x000f00 RW  0x4000
```

NEEDED:
```
 0x0000000000000001 (NEEDED)             Shared library: [libintl.so]
 0x0000000000000001 (NEEDED)             Shared library: [libm.so]
 0x0000000000000001 (NEEDED)             Shared library: [libc.so]
```

### libgmodule-2.0.so
build/prebuilt/android-arm64-v8a-16kb/lib/libgmodule-2.0.so: ELF 64-bit LSB shared object, ARM aarch64, version 1 (SYSV), dynamically linked, with debug_info, not stripped
503838ee662fe3d8da92870ef35eb5c92805e3f92283a8fa70e71930c0ab67ed  build/prebuilt/android-arm64-v8a-16kb/lib/libgmodule-2.0.so

```
  LOAD           0x000000 0x0000000000000000 0x0000000000000000 0x00166c 0x00166c R   0x4000
  LOAD           0x00166c 0x000000000000566c 0x000000000000566c 0x0011a4 0x0011a4 R E 0x4000
  LOAD           0x002810 0x000000000000a810 0x000000000000a810 0x000338 0x0007f0 RW  0x4000
  LOAD           0x002b48 0x000000000000eb48 0x000000000000eb48 0x000020 0x000050 RW  0x4000
```

NEEDED:
```
 0x0000000000000001 (NEEDED)             Shared library: [libglib-2.0.so]
 0x0000000000000001 (NEEDED)             Shared library: [libdl.so]
 0x0000000000000001 (NEEDED)             Shared library: [libc.so]
```

### libgobject-2.0.so
build/prebuilt/android-arm64-v8a-16kb/lib/libgobject-2.0.so: ELF 64-bit LSB shared object, ARM aarch64, version 1 (SYSV), dynamically linked, with debug_info, not stripped
cde6f8a3c5b7fe5b50dcad0b8236e3b8ab0ca20aaa09c5a47920c807315b30bc  build/prebuilt/android-arm64-v8a-16kb/lib/libgobject-2.0.so

```
  LOAD           0x000000 0x0000000000000000 0x0000000000000000 0x027bc0 0x027bc0 R   0x4000
  LOAD           0x027bc0 0x000000000002bbc0 0x000000000002bbc0 0x032850 0x032850 R E 0x4000
  LOAD           0x05a410 0x0000000000062410 0x0000000000062410 0x002f28 0x003bf0 RW  0x4000
  LOAD           0x05d338 0x0000000000069338 0x0000000000069338 0x000068 0x000bb0 RW  0x4000
```

NEEDED:
```
 0x0000000000000001 (NEEDED)             Shared library: [libglib-2.0.so]
 0x0000000000000001 (NEEDED)             Shared library: [libffi.so]
 0x0000000000000001 (NEEDED)             Shared library: [libc.so]
```

### libgthread-2.0.so
build/prebuilt/android-arm64-v8a-16kb/lib/libgthread-2.0.so: ELF 64-bit LSB shared object, ARM aarch64, version 1 (SYSV), dynamically linked, with debug_info, not stripped
be4227ffff73563c7612e50440e6156f8577882f3541775fed33a9e4265c750a  build/prebuilt/android-arm64-v8a-16kb/lib/libgthread-2.0.so

```
  LOAD           0x000000 0x0000000000000000 0x0000000000000000 0x000778 0x000778 R   0x4000
  LOAD           0x000778 0x0000000000004778 0x0000000000004778 0x000148 0x000148 R E 0x4000
  LOAD           0x0008c0 0x00000000000088c0 0x00000000000088c0 0x0001e8 0x000740 RW  0x4000
```

NEEDED:
```
 0x0000000000000001 (NEEDED)             Shared library: [libglib-2.0.so]
 0x0000000000000001 (NEEDED)             Shared library: [libc.so]
```

### libintl.so
build/prebuilt/android-arm64-v8a-16kb/lib/libintl.so: ELF 64-bit LSB shared object, ARM aarch64, version 1 (SYSV), dynamically linked, with debug_info, not stripped
3af2db80bf9088f8d2dcb027edb1f82f8013171cf1024acf97cc79c5fe75c0cc  build/prebuilt/android-arm64-v8a-16kb/lib/libintl.so

```
  LOAD           0x000000 0x0000000000000000 0x0000000000000000 0x000980 0x000980 R   0x4000
  LOAD           0x000980 0x0000000000004980 0x0000000000004980 0x000250 0x000250 R E 0x4000
  LOAD           0x000bd0 0x0000000000008bd0 0x0000000000008bd0 0x0001c8 0x000430 RW  0x4000
  LOAD           0x000d98 0x000000000000cd98 0x000000000000cd98 0x000000 0x00000d RW  0x4000
```

NEEDED:
```
 0x0000000000000001 (NEEDED)             Shared library: [libc.so]
```

### libjson-glib-1.0.so
build/prebuilt/android-arm64-v8a-16kb/lib/libjson-glib-1.0.so: ELF 64-bit LSB shared object, ARM aarch64, version 1 (SYSV), dynamically linked, with debug_info, not stripped
3797e3bd0f3d28c0d99c629b72e1f877737240c1a102a9b06b107735a002bd18  build/prebuilt/android-arm64-v8a-16kb/lib/libjson-glib-1.0.so

```
  LOAD           0x000000 0x0000000000000000 0x0000000000000000 0x0119c0 0x0119c0 R   0x4000
  LOAD           0x0119c0 0x00000000000159c0 0x00000000000159c0 0x017ad0 0x017ad0 R E 0x4000
  LOAD           0x029490 0x0000000000031490 0x0000000000031490 0x000d50 0x001b70 RW  0x4000
  LOAD           0x02a1e0 0x00000000000361e0 0x00000000000361e0 0x000000 0x000188 RW  0x4000
```

NEEDED:
```
 0x0000000000000001 (NEEDED)             Shared library: [libgio-2.0.so]
 0x0000000000000001 (NEEDED)             Shared library: [libgobject-2.0.so]
 0x0000000000000001 (NEEDED)             Shared library: [libglib-2.0.so]
 0x0000000000000001 (NEEDED)             Shared library: [libc.so]
```


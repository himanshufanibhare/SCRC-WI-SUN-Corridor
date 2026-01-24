# Wi-SUN Corridor Light

Overview
--------
This repository contains firmware and tools for the Wi-SUN Corridor Light project. It includes an embedded C firmware (built with Silicon Labs/Simplicity Studio toolchain) for a streetlight node and a small Python application used for higher-level scripts and utilities.

Top-level layout
----------------
- `Documents/` — project documentation and design notes.
- `Hardware/` — hardware schematics, board layouts and related files.
- `Software/` — source code and build artifacts.
  - `scrc_streetlight/` — Embedded firmware (C) project for the streetlight node.
    - Key files:
      - `app.c`, `main.c` — firmware entry points.
      - `app_*.c`, `app_*.h` — application modules (UDP/TCP/CoAP servers, timestamp, rtt traces, neighbor checks etc.).
      - `autogen/` — auto-generated configuration and board support files (linker, radioconf, RTE components).
      - `config/` — project configuration headers for build-time options and board specifics.
      - `GNU ARM v12.2.1 - Debug/` — IDE build output (may contain object files and map files).
      - `simplicity_sdk_2025.6.2/` — SDK layout used by the project.
    - Project files: `.pintool`, `.slcp`, `.slps` — Simplicity Studio project/workspace files.
  - `SCRC-WI-SUN-Corridor/` — Python-based utilities and possibly test / server scripts.
    - `app.py` — main Python utility.
    - `requirements.txt` — Python dependencies.
    - `static/` — static assets used by the Python app.

Building the firmware (embedded)
--------------------------------
Notes: This firmware is intended to be built with Silicon Labs Simplicity Studio or an ARM GCC toolchain configured to match the project settings. The repository contains auto-generated files and SDK references under `scrc_streetlight/autogen` and `simplicity_sdk_2025.6.2/`.

Common steps (Simplicity Studio):
1. Open Simplicity Studio and import the `.slcp` or `.slps` project from `Software/scrc_streetlight/`.
2. Let the IDE resolve SDK paths (point it at the `simplicity_sdk_2025.6.2/` folder if needed).
3. Build using the IDE build button or build target (Debug/Release) — the `GNU ARM v12.2.1 - Debug/` directory contains one possible build output.
4. Flash using the connected debugger (e.g., J-Link / Silicon Labs debugger) via the IDE.

Command-line (GCC/Make):
- This project does not include a generic Makefile at the root. If you maintain a CLI build, adapt the toolchain settings from Simplicity Studio-generated build commands or use the SDK's example Makefiles.

Python app (utilities)
----------------------
The `SCRC-WI-SUN-Corridor` folder contains a Python utility. To run it:

1. Create a virtual environment (recommended):

   powershell
   ```powershell
   python -m venv .venv; .\.venv\Scripts\Activate.ps1
   ```

2. Install dependencies:

   ```powershell
   pip install -r SCRC-WI-SUN-Corridor/requirements.txt
   ```

3. Run the app:

   ```powershell
   python SCRC-WI-SUN-Corridor/app.py
   ```

Repository conventions and notes
--------------------------------
- Generated files are placed under `scrc_streetlight/autogen/`. Avoid editing those files directly—regenerate using the project generation tools if needed.
- Keep SDK and toolchain versions in sync with Simplicity Studio; the project was prepared with Simplicity SDK `2025.6.2` and GNU ARM `v12.2.1` (Debug config present).

Contributing
------------
- Fork the repository or create branches for feature work.
- For firmware changes, build and test on hardware or in a validated emulator before opening pull requests.
- Keep commit messages descriptive and include which board or configuration you tested against.

License
-------
No explicit license file was found in the workspace. If you intend to publish this repository, add a `LICENSE` file (for example MIT or Apache-2.0) and update this section.

Contact / Maintainers
---------------------
Add maintainer contact information here or link to project issue tracker.


Changelog / History
-------------------
Keep this section or `CHANGELOG.md` updated for notable releases.

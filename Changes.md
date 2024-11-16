# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

-

### Changed

-

### Removed

-

### Fixed

-

## [0.1.1] - 2023-11-16

### Fixed

- Replaces greedy sub step of balancing algorithm with a more generic approach. This enables a higher probability to find a global optimum. Previously the step only swapped players between best and worst team. Now it tries to swap players between any teams where an improvement is possible.

## [0.1.0] - 2023-08-19

### Added

- First Team Generator Model
- Basic View for adding files, editing players and generating teams
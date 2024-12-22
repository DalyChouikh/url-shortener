package frontend

import "embed"

//go:embed dist/*
var distFiles embed.FS

// DistFiles exports the embedded dist directory
func FS() embed.FS {
	return distFiles
}

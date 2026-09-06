import h5py
import numpy as np
import json

file_path = "../public/assets/rainfull.HDF5"
dataset_name = "Grid/Intermediate/IRprecipitation"

with h5py.File(file_path, "r") as hdf:
    print("Available datasets:", list(hdf.keys()))
    precip_data = np.array(hdf[dataset_name][0, :, :])  # take first time slice
    print("Original data shape:", precip_data.shape)

step = 10
grid = precip_data[::step, ::step]
print("Reduced grid shape:", grid.shape)

grid_min, grid_max = np.min(grid), np.max(grid)
normalized_grid = (grid - grid_min) / (grid_max - grid_min)

json_grid = normalized_grid.tolist()
output_file = "raingrid.json"
with open(output_file, "w") as f:
    json.dump(json_grid, f)

print(f"Phaser-ready JSON grid saved as '{output_file}'")

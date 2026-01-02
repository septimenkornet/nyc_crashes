import pandas
import sys
import geopandas as gpd

criteria_columns = [ 'NUMBER OF PEDESTRIANS INJURED',
   'NUMBER OF PEDESTRIANS KILLED', 'NUMBER OF CYCLIST INJURED',
   'NUMBER OF CYCLIST KILLED'
]

all_columns = ['CRASH DATE', 'CRASH TIME', 'BOROUGH', 'ZIP CODE', 'LATITUDE',
       'LONGITUDE', 'LOCATION', 'ON STREET NAME', 'CROSS STREET NAME',
       'OFF STREET NAME', 'NUMBER OF PERSONS INJURED',
       'NUMBER OF PERSONS KILLED', 'NUMBER OF PEDESTRIANS INJURED',
       'NUMBER OF PEDESTRIANS KILLED', 'NUMBER OF CYCLIST INJURED',
       'NUMBER OF CYCLIST KILLED', 'NUMBER OF MOTORIST INJURED',
       'NUMBER OF MOTORIST KILLED', 'CONTRIBUTING FACTOR VEHICLE 1',
       'CONTRIBUTING FACTOR VEHICLE 2', 'CONTRIBUTING FACTOR VEHICLE 3',
       'CONTRIBUTING FACTOR VEHICLE 4', 'CONTRIBUTING FACTOR VEHICLE 5',
       'COLLISION_ID', 'VEHICLE TYPE CODE 1', 'VEHICLE TYPE CODE 2',
       'VEHICLE TYPE CODE 3', 'VEHICLE TYPE CODE 4', 'VEHICLE TYPE CODE 5'
]

df = pandas.read_csv(sys.argv[1])

df = df[(
         (
                    (df['NUMBER OF PEDESTRIANS INJURED'] > 0) |
                    (df['NUMBER OF PEDESTRIANS KILLED'] > 0) |
                    (df['NUMBER OF CYCLIST INJURED'] > 0) |
                    (df['NUMBER OF CYCLIST KILLED'] > 0)
         ) &
         (
                    df['BOROUGH' == 'MANHATTAN']
         )
        ]

gdf = gpd.GeoDataFrame(
    df,
    geometry=gpd.points_from_xy(df.LATITUDE, df.LONGITUDE),
    crs="EPSG:4326"  # WGS84 standard CRS for lat/lon
)

# gdf['CRASH DATE'] = gdf['CRASH DATE'].dt.strftime('%Y-%m-%d')

print(gdf.to_json())
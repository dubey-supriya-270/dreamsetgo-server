CREATE TABLE hexagons (
  "id" SERIAL PRIMARY KEY,
  "name" varchar(255) ,
  "neighbor_name" varchar(255),
  "border_number" integer,
  CONSTRAINT unique_pairs UNIQUE (name, neighbor_name, border_number)
);


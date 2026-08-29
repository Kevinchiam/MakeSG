insert into services (slug, name, description, service_group) values
  ('woodworking','Woodworking','Fabrication for timber furniture, objects and fit-outs.','Fabrication'),
  ('carpentry','Carpentry','Site and workshop carpentry for spatial projects.','Fabrication'),
  ('cnc-routing','CNC routing','Flat-bed routing for wood, plastics and composites.','Digital fabrication'),
  ('metal-fabrication','Metal fabrication','Cutting, bending, welding and assembly for metal work.','Fabrication'),
  ('cnc-machining','CNC machining','Precision milling and turning for metals and plastics.','Digital fabrication'),
  ('metal-finishing','Metal finishing','Anodising, polishing, powder coating and patina work.','Finishing'),
  ('3d-printing','3D printing','Additive manufacturing for prototypes, jigs and small parts.','Digital fabrication'),
  ('model-making','Model making','Architectural, exhibition and product model production.','Prototyping'),
  ('product-design','Product design','Industrial design, prototyping strategy and DFM support.','Design'),
  ('creative-technology','Creative technology','Interactive installations and experience prototyping.','Technology'),
  ('electronics-prototyping','Electronics prototyping','Sensors, lighting, PCB and embedded system prototypes.','Technology'),
  ('event-fabrication','Event fabrication','Temporary structures, pop-ups and activations.','Spatial'),
  ('installation','Installation','Art, retail and exhibition installation support.','Spatial'),
  ('signage','Signage','Wayfinding, dimensional signs and vinyl graphics.','Print'),
  ('packaging-design','Packaging design','Structural and graphic packaging design.','Design'),
  ('printing','Printing','Digital, large-format, risograph and specialty printing.','Print'),
  ('die-cutting','Die cutting','Short-run die cutting, creasing and finishing.','Print'),
  ('ceramics','Ceramics','Clay object prototyping, production and glaze testing.','Craft'),
  ('mould-making','Mould making','Silicone, plaster and production moulds.','Prototyping'),
  ('kiln-firing','Kiln firing','Firing services for clay, glaze and glass work.','Craft')
on conflict (slug) do nothing;

insert into materials (slug, name) values
  ('aluminium','aluminium'),('plywood','plywood'),('mild-steel','mild steel'),('stainless-steel','stainless steel'),('acrylic','acrylic'),
  ('brass','brass'),('ceramic','ceramic'),('fabric','fabric'),('paper','paper'),('cardboard','cardboard'),('resin','resin'),
  ('foam','foam'),('bamboo','bamboo'),('glass','glass'),('electronics','electronics')
on conflict (slug) do nothing;

-- This seed now keeps only shared lookup data. Live business listings should be
-- created through the onboarding and admin approval workflows.

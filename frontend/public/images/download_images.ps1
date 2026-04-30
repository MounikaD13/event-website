$base = 'c:\Users\USER\Desktop\Tasks\event-website\frontend\public\images\'

$files = @(
  @('event_beach_wedding.jpg',     'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=700&q=85'),
  @('event_santorini_wedding.jpg', 'https://images.unsplash.com/photo-1570053756420-77a9018e24c0?w=700&q=85'),
  @('event_maldives_retreat.jpg',  'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=700&q=85'),
  @('event_dubai_gala.jpg',        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=85'),
  @('event_paris_dinner.jpg',      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=700&q=85'),
  @('event_tokyo_conf.jpg',        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=700&q=85'),
  @('event_tuscany_wedding.jpg',   'https://images.unsplash.com/photo-1565716875584-da13f3b26e5b?w=700&q=85'),
  @('event_maldives_party.jpg',    'https://images.unsplash.com/photo-1602002418082-dd4a3f7791f3?w=700&q=85'),
  @('dest_bali.jpg',               'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=700&q=85'),
  @('dest_santorini.jpg',          'https://images.unsplash.com/photo-1570053756420-77a9018e24c0?w=700&q=85'),
  @('dest_maldives.jpg',           'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=700&q=85'),
  @('dest_dubai.jpg',              'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=85'),
  @('dest_paris.jpg',              'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=700&q=85'),
  @('dest_tokyo.jpg',              'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=700&q=85'),
  @('about_ceremony.jpg',          'https://images.unsplash.com/photo-1519741497674-611481863552?w=700&q=85'),
  @('about_gala.jpg',              'https://images.unsplash.com/photo-1511578314322-379afb476865?w=700&q=85')
)

foreach ($pair in $files) {
  $name = $pair[0]
  $url  = $pair[1]
  Write-Host "Downloading $name ..."
  Invoke-WebRequest -Uri $url -OutFile ($base + $name) -UseBasicParsing
  Write-Host "  -> OK"
}

Write-Host "`nAll images downloaded!"

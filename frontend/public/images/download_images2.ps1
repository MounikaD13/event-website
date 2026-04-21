$base = 'c:\Users\USER\Desktop\Tasks\event-website\frontend\public\images\'

$files = @(
  # Replace failed images with these working alternative URLs
  @('event_santorini_wedding.jpg', 'https://images.unsplash.com/photo-1613395877344-13c475d40bd3?w=700&q=85'),
  @('event_tuscany_wedding.jpg',   'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=700&q=85'),
  @('event_maldives_party.jpg',    'https://images.unsplash.com/photo-1479634937748-0c6a8fb21eaf?w=700&q=85'),
  @('dest_santorini.jpg',          'https://images.unsplash.com/photo-1613395877344-13c475d40bd3?w=700&q=85'),
  
  # Avatars
  @('avatar_sarah.jpg', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&q=85'),
  @('avatar_james.jpg', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=85'),
  @('avatar_emma.jpg',  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=85'),
  @('avatar_priya.jpg', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=85'),

  # Contact Page background
  @('contact_bg.jpg', 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1400&q=85')
)

foreach ($pair in $files) {
  $name = $pair[0]
  $url  = $pair[1]
  Write-Host "Downloading $name ..."
  Invoke-WebRequest -Uri $url -OutFile ($base + $name) -UseBasicParsing
  Write-Host "  -> OK"
}

Write-Host "`nImages downloaded!"

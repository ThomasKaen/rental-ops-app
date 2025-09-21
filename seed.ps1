$ErrorActionPreference = "Stop"
$API = "http://127.0.0.1:8000"

function POST($path, $obj) {
  Write-Host "POST $path" -ForegroundColor Cyan
  Invoke-RestMethod -Uri "$API$path" -Method Post `
    -ContentType "application/json" -Body ($obj | ConvertTo-Json -Depth 5)
}

function GET($path) {
  Write-Host "GET  $path" -ForegroundColor Yellow
  Invoke-RestMethod -Uri "$API$path" -Method Get
}

# ---- Sites ----
$s1 = POST "/sites" @{ name = "Riverside Apartments"; address = "SE16" }
$s2 = POST "/sites" @{ name = "Docklands Lofts";     address = "E14" }
GET "/sites" | Out-Host

# ---- Units ----
$u1 = POST "/units" @{ site_id = $s1.id; name = "1A" }
$u2 = POST "/units" @{ site_id = $s1.id; name = "1B" }
GET "/units?site_id=$($s1.id)" | Out-Host

# ---- Tasks ----
$t1 = POST "/tasks" @{
  site_id = $s1.id; unit_id = $u1.id; title = "Leak under sink";
  description = "Standing water, guest at 6pm"; priority = "red"
}
$t2 = POST "/tasks" @{
  site_id = $s1.id; unit_id = $u2.id; title = "TV remote missing";
  description = "Spare needed"; priority = "amber"
}
GET "/tasks" | Out-Host

# ---- Inventory ----
$i1 = POST "/inventory/items" @{ sku="TR-001"; name="Toilet Roll"; uom="roll"; min_level_default=12 }
$i2 = POST "/inventory/items" @{ sku="CL-APC"; name="All-Purpose Cleaner"; uom="L";   min_level_default=2 }

$st1 = POST "/inventory/stock" @{ site_id=$s1.id; item_id=$i1.id }
$st2 = POST "/inventory/stock" @{ site_id=$s1.id; item_id=$i2.id }

POST "/inventory/movements" @{ stock_id=$st1.id; delta_qty=24; reason="delivery"; reference="INV-1001"; author="tamas" } | Out-Null
POST "/inventory/movements" @{ stock_id=$st1.id; delta_qty=-3; reason="usage";    author="cleaner-1" } | Out-Null

GET "/inventory/stock?site_id=$($s1.id)" | Out-Host

Write-Host "`nDone. Open http://127.0.0.1:5173 and check Tasks / Inventory." -ForegroundColor Green

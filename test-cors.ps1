$headers = @{
    'Origin' = 'https://www.kidzstorymagic.org'
    'Access-Control-Request-Method' = 'POST'
}

try {
    $response = Invoke-WebRequest -Uri 'https://kidzstorymagic-api.railway.app/api/auth/register' `
        -Method OPTIONS `
        -Headers $headers
    
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "`nCORS Headers:"
    $response.Headers.GetEnumerator() | Where-Object { $_.Key -like '*Access-Control*' -or $_.Key -like '*Origin*' } | ForEach-Object {
        Write-Host "$($_.Key): $($_.Value)"
    }
}
catch {
    $response = $_.Exception.Response
    if ($response) {
        Write-Host "Status Code: $($response.StatusCode)"
        Write-Host "`nCORS Headers:"
        $response.Headers | Where-Object { $_.Key -like '*Access-Control*' -or $_.Key -like '*Origin*' } | ForEach-Object {
            Write-Host "$($_.Key): $($_.Value)"
        }
    }
    Write-Host "Error: $_"
}

# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY website.Server/website.Server.csproj ./website.Server/
RUN dotnet restore ./website.Server/website.Server.csproj

# Copy everything else and build
COPY . .
WORKDIR /src/website.Server
RUN dotnet publish -c Release -o /app/out

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/out ./

# Expose port (adjust if your app uses a different port)
EXPOSE 80
EXPOSE 443

# Run the app
ENTRYPOINT ["dotnet", "website.Server.dll"]

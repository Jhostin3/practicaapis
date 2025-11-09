
import { searchAnime } from 'animeflv-api';
import { ExpoRequest } from 'expo-router/server';

export async function GET(request: ExpoRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');

  if (!title) {
    return Response.json({ error: 'El título es requerido' }, { status: 400 });
  }

  const simplifiedTitle = title.split(':')[0].trim();

  try {
    let finalUrl: string | null = null;

    // Función auxiliar para procesar los resultados según la documentación CORRECTA
    const processResults = (results: any): string | null => {
      // La documentación que me pasaste muestra que los resultados están en la propiedad 'data'
      if (results && results.data && results.data.length > 0 && results.data[0].url) {
        // La URL ya viene completa, no hay que añadirle nada
        return results.data[0].url;
      }
      return null;
    };

    // Intento 1: Con título simplificado
    const simplifiedResults = await searchAnime(simplifiedTitle);
    finalUrl = processResults(simplifiedResults);

    // Intento 2: Con título original si el primero falla
    if (!finalUrl) {
      const originalResults = await searchAnime(title);
      finalUrl = processResults(originalResults);
    }

    return Response.json({ url: finalUrl });

  } catch (error) {
    console.error('[API /api/animeflv] Error en animeflv-api:', error);
    return Response.json({ error: 'Error interno al buscar en AnimeFLV' }, { status: 500 });
  }
}

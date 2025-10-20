import * as cheerio from 'cheerio';

export const searchSongsTab4U = async (query: string) => {
    try {
        // Build the search URL with the query parameter
        const url = `https://www.tab4u.com/resultsSimple?tab=songs&q=${encodeURIComponent(query)}`;

        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': 'text/html',
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch search page: ${res.statusText}`);
        }

        const html = await res.text();
        // Load the HTML into cheerio for parsing
        const $ = cheerio.load(html);

        const results: Array<{ title: string; artist: string; link: string; image: string }> = [];
        // Iterate over each song container div
        $('div.ruSongUnit').each((_, elem) => {
            const el = $(elem);

            const title = el.find('.sNameI19').text().trim();
            const artist = el.find('.aNameI19').text().trim();
            const relativeLink = el.find('a.ruSongLink').attr('href') || '';
            const link = relativeLink ? `https://www.tab4u.com/${relativeLink}` : '';

            const style = el.find('.ruArtPhoto').attr('style') || '';
            const match = style.match(/url\(['"]?(.*?)['"]?\)/);
            const image = match ? `https://www.tab4u.com${match[1]}` : '';

            if (title && link) {
                results.push({ title, artist, link, image });
            }
        });

        return results;
    } catch (error) {
        console.error('Error fetching search results:', error);
        throw error;
    }
};

export const getSongContentFromTab4U = async (link: string) => {
  try {
    const res = await fetch(link, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/html',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch song page: ${res.statusText}`);
    }
    const html = await res.text();
    const $ = cheerio.load(html);
    const songContent = $('#songContentTPL');
    if (!songContent.length) throw new Error('Could not find song content!');

    // Remove event attributes
    songContent.find('[onmouseover], [onmouseout], [onclick], [onmouseenter], [onmouseleave]').each((_, el) => {
      $(el).removeAttr('onmouseover onmouseout onclick onmouseenter onmouseleave');
    });

    const contentHtml = songContent.html() || '';

    const rawLines: string[] = [];
    songContent.find('table tr').each((_, tr) => {
          const rowText = $(tr).text().trim();
          if (rowText) {
              rawLines.push(rowText);
          }
      });

      const rawText = rawLines.join('\n');

      const chordsLines: string[] = [];
      const lyricsLines: string[] = [];

      songContent.find('table tr').each((_, tr) => {
        const chords = $(tr).find('td.chords, td.chords_en').text().trim();
        const lyrics = $(tr).find('td.song').text().trim();
        chordsLines.push(chords);
        lyricsLines.push(lyrics);
      });

      const chords = chordsLines.join('\n');
      const lyrics = lyricsLines.join('\n');

      return {
          contentHtml,
          chords,
          lyrics,
          rawText,
      };
  } catch (error) {
    console.error('Error scraping song content:', error);
    return {
      lyrics: [],
      chords: [],
      rawText: '',
      contentHtml: '',
    };
  }
};
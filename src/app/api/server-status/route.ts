import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface McsrvstatV3Response {
  online: boolean;
  ip?: string;
  port?: number;
  hostname?: string;
  debug?: {
    ping?: boolean;
    query?: boolean;
    bedrock?: boolean;
    srv?: boolean;
    querymismatch?: boolean;
    ipinsrv?: boolean;
    cnameinsrv?: boolean;
    animatedmotd?: boolean;
    cachehit?: boolean;
    cachetime?: number;
    cacheexpire?: number;
    apiversion?: number;
  };
  version?: string;
  software?: string;
  protocol?: {
    version?: number;
    name?: string;
  };
  icon?: string;
  motd?: {
    raw?: string[];
    clean?: string[];
    html?: string[];
  };
  players?: {
    online?: number;
    max?: number;
    list?: Array<{
      name: string;
      uuid: string;
    }>;
  };
  eula_blocked?: boolean;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address')?.trim();
    const type = (searchParams.get('type') || 'java').toLowerCase();

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    // Sanitize address (strip protocols like minecraft:// or http:// if user passed them)
    const sanitizedAddress = address
      .replace(/^(minecraft:\/\/|https?:\/\/)/i, '')
      .replace(/\/+$/, '')
      .trim();

    // Select endpoint according to official mcsrvstat.us API v3 specifications:
    // Java: https://api.mcsrvstat.us/3/<address>
    // Bedrock: https://api.mcsrvstat.us/bedrock/3/<address>
    const isBedrock = type === 'bedrock';
    // mcsrvstat.us expects hostname:port with literal colon, not encoded %3A
    const cleanAddressPath = sanitizedAddress.split(':').map(part => encodeURIComponent(part)).join(':');
    const apiUrl = isBedrock
      ? `https://api.mcsrvstat.us/bedrock/3/${cleanAddressPath}`
      : `https://api.mcsrvstat.us/3/${cleanAddressPath}`;

    // Required by mcsrvstat.us:
    // "A descriptive and non-empty User-Agent request header is required when querying the API, otherwise you will get a 403 Forbidden response."
    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'NightmareMC-Store/2.0 (Minecraft Server Status Proxy; +https://store.nightmaremc.com; contact@nightmaremc.com)',
        'Accept': 'application/json',
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.warn(`mcsrvstat.us returned status ${res.status} for ${sanitizedAddress}`);
      return NextResponse.json(
        {
          online: false,
          address: sanitizedAddress,
          type: isBedrock ? 'bedrock' : 'java',
          players: { online: 0, max: 0 },
          motd: { clean: ['Server status temporarily unavailable'], html: [] },
          icon: null,
          version: null,
          error: `External status API returned HTTP ${res.status}`,
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
          },
        }
      );
    }

    const data: McsrvstatV3Response = await res.json();

    return NextResponse.json(
      {
        online: Boolean(data.online),
        address: sanitizedAddress,
        type: isBedrock ? 'bedrock' : 'java',
        ip: data.ip || null,
        port: data.port || (isBedrock ? 19132 : 25565),
        hostname: data.hostname || sanitizedAddress,
        version: data.version || null,
        software: data.software || null,
        protocol: data.protocol || null,
        icon: data.icon || null,
        motd: {
          raw: data.motd?.raw || [],
          clean: data.motd?.clean || [],
          html: data.motd?.html || [],
        },
        players: {
          online: data.players?.online ?? 0,
          max: data.players?.max ?? 0,
          list: data.players?.list ?? [],
        },
        debug: {
          ping: data.debug?.ping ?? null,
          query: data.debug?.query ?? null,
          srv: data.debug?.srv ?? null,
          cached: data.debug?.cachehit ?? false,
          apiversion: data.debug?.apiversion ?? 3,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error: any) {
    console.error('Failed to proxy server status:', error);
    return NextResponse.json(
      {
        online: false,
        error: error.message || 'Failed to fetch Minecraft server status',
        players: { online: 0, max: 0 },
        motd: { clean: [], html: [] },
      },
      { status: 200 }
    );
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { RequesterQueryDto } from '../dto/stat/total-stat.dto';
import {
  DashboardQueryDtoEnum,
  RequesterStatusEnum,
} from '../definitions/enums';
import { RequesterService } from './requester/requester.service';

interface EmitterStat {
  total: number;
  breakdown: Record<string, number>;
}

interface CentreStat {
  total: number;
  open: number;
  treated: number;
  cancelled: number;
  closed: number;
  approved: number;
  rejected: number;
}

interface DashboardStats {
  globalStats: {
    totalRequests: number;
    openRequests: number;
    closedRequests: number;
    treatedRequests: number;
    rejectedRequests: number;
    approvedRequests: number;
    cancelledRequests: number;
    uniqueEmitters: number;
    uniqueTypes: number;
  };
  emitterStats: {
    emitter: string;
    total: number;
    mostFrequentType: string;
    breakdown: Record<string, number>;
  }[];
  centreStats: {
    centre: string;
    total: number;
    open: number;
    treated: number;
    cancelled: number;
    approved: number;
    rejected: number;
  }[];
}

@Injectable()
export class StatService {
  constructor(protected requesterService: RequesterService) {}

  async getDashboardStats(dto: RequesterQueryDto): Promise<DashboardStats & Record<string, any>> {
    const qb = this.requesterService.repository
      .createQueryBuilder('requester')
      .leftJoinAndSelect('requester.createdBy', 'createdBy')
      .leftJoinAndSelect('requester.station', 'station')
      .leftJoinAndSelect('requester.requesttype', 'requesttype')
      .leftJoinAndSelect('requester.branch', 'branch')
      .leftJoinAndSelect('requester.labAgent', 'labAgent');

    // --- Filtrage par période simple ---
    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (dto.period) {
      case DashboardQueryDtoEnum.lastYear:
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
        break;
      case DashboardQueryDtoEnum.yearMinus2:
        start = new Date(now.getFullYear() - 2, 0, 1);
        end = new Date(now.getFullYear() - 2, 11, 31, 23, 59, 59);
        break;
      case DashboardQueryDtoEnum.yearMinus3:
        start = new Date(now.getFullYear() - 3, 0, 1);
        end = new Date(now.getFullYear() - 3, 11, 31, 23, 59, 59);
        break;
      case DashboardQueryDtoEnum.currentYear:
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case DashboardQueryDtoEnum.lastMonth:
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;
      case DashboardQueryDtoEnum.currentMonth:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        start = new Date();
        start.setDate(start.getDate() - 28);
    }

    qb.andWhere('requester.createdAt BETWEEN :start AND :end', { start, end });
    if (dto.userId) {
      // andWhere (et non where) pour ne pas écraser le filtre de période.
      // Une opératrice voit ses demandes + celles créées pour elle.
      qb.andWhere(
        '(createdBy.userId = :userId OR requester.operator_id = :userId)',
        { userId: dto.userId },
      );
    }
    // --- Filtre branchId ---
    if (dto.branchId) {
      qb.andWhere('requester.branchId = :branchId', { branchId: dto.branchId });
    }

    // --- Filtrage avancé via where (JSON) ---
    if (dto.where) {
      let filters: any[];
      try {
        filters = JSON.parse(dto.where);
      } catch {
        throw new BadRequestException('Invalid where format');
      }

      filters.forEach((filter) => {
        const attr = filter.attribute;
        const val = filter.value;
        const type = filter.type;

        if (attr !== 'createdAt') return; // whitelist

        switch (type) {
          case 'equals':
            qb.andWhere(`DATE(requester.${attr}) = DATE(:${attr}_eq)`, {
              [`${attr}_eq`]: new Date(val),
            });
            break;
          case 'greaterThan':
            qb.andWhere(`requester.${attr} > :${attr}_gt`, {
              [`${attr}_gt`]: new Date(val),
            });
            break;
          case 'greaterThanOrEquals':
            qb.andWhere(`requester.${attr} >= :${attr}_gte`, {
              [`${attr}_gte`]: new Date(val),
            });
            break;
          case 'lessThan':
            qb.andWhere(`requester.${attr} < :${attr}_lt`, {
              [`${attr}_lt`]: new Date(val),
            });
            break;
          case 'lessThanOrEquals':
            qb.andWhere(`requester.${attr} <= :${attr}_lte`, {
              [`${attr}_lte`]: new Date(val),
            });
            break;
          case 'between':
            const [startDate, endDate] = val;
            qb.andWhere(
              `requester.${attr} BETWEEN :${attr}_start AND :${attr}_end`,
              {
                [`${attr}_start`]: new Date(startDate),
                [`${attr}_end`]: new Date(endDate),
              },
            );
            break;
          default:
            throw new BadRequestException(
              `Unsupported filter type: ${filter.type}`,
            );
        }
      });
    }

    const requests = await qb.getMany();
    const emitterRequests = requests;
    // --- Stats par émetteur avec filtre date ---

    // --- Global stats ---
    const globalStats = {
      totalRequests: requests.length,
      openRequests: requests.filter(
        (r) => r.status === RequesterStatusEnum.Open,
      ).length,
      closedRequests: requests.filter(
        (r) => r.status === RequesterStatusEnum.Closed,
      ).length,
      treatedRequests: requests.filter(
        (r) => r.status === RequesterStatusEnum.Treated,
      ).length,
      rejectedRequests: requests.filter(
        (r) => r.status === RequesterStatusEnum.Rejected,
      ).length,
      approvedRequests: requests.filter(
        (r) => r.status === RequesterStatusEnum.Approved,
      ).length,
      cancelledRequests: requests.filter(
        (r) => r.status === RequesterStatusEnum.Cancelled,
      ).length,
      uniqueEmitters: new Set(
        requests.map((r) => r.createdBy?.userData?.username ?? 'Unknown'),
      ).size,
      uniqueTypes: new Set(
        requests.map((r) => r.requesttype?.displayName ?? 'Other'),
      ).size,
    };

    // --- Stats par émetteur ---
    const emitterMap: Record<string, EmitterStat> = {};

    requests.forEach((r) => {
      const emitter = r.createdBy?.userData?.username ?? 'Unknown';
      const type = r.requesttype?.displayName ?? 'Other';

      if (!emitterMap[emitter])
        emitterMap[emitter] = { total: 0, breakdown: {} };
      emitterMap[emitter].total++;
      emitterMap[emitter].breakdown[type] =
        (emitterMap[emitter].breakdown[type] || 0) + 1;
    });

    const filteredEmitterMap: Record<string, EmitterStat> = {};
    emitterRequests.forEach((r) => {
      const emitter = r.createdBy?.userData?.username ?? 'Unknown';
      const type = r.requesttype?.displayName ?? 'Other';

      if (!filteredEmitterMap[emitter])
        filteredEmitterMap[emitter] = { total: 0, breakdown: {} };
      filteredEmitterMap[emitter].total++;
      filteredEmitterMap[emitter].breakdown[type] =
        (filteredEmitterMap[emitter].breakdown[type] || 0) + 1;
    });

    const emitterStats = Object.entries(filteredEmitterMap)
      .map(([emitter, info]) => ({
        emitter,
        total: info.total,
        breakdown: info.breakdown,
        mostFrequentType:
          Object.entries(info.breakdown).sort((a, b) => b[1] - a[1])[0]?.[0] ??
          'Unknown',
      }))
      .sort((a, b) => b.total - a.total) // 🔽 du plus grand au plus petit
      .slice(0, 6); // 🏆 les 6 premiers

    // --- Stats par centre logistique ---
    const centreMap: Record<string, CentreStat> = {};
    requests.forEach((r) => {
      const centre = r.station?.displayName ?? 'Unknown';
      if (!centreMap[centre])
        centreMap[centre] = {
          total: 0,
          open: 0,
          treated: 0,
          cancelled: 0,
          closed: 0,
          approved: 0,
          rejected: 0,
        };
      centreMap[centre].total++;
      if (r.status === RequesterStatusEnum.Open) centreMap[centre].open++;
      if (r.status === RequesterStatusEnum.Treated) centreMap[centre].treated++;
      if (r.status === RequesterStatusEnum.Closed) centreMap[centre].closed++;
      if (r.status === RequesterStatusEnum.Cancelled)
        centreMap[centre].cancelled++;
      if (r.status === RequesterStatusEnum.Approved)
        centreMap[centre].approved++;
      if (r.status === RequesterStatusEnum.Rejected)
        centreMap[centre].rejected++;
    });

    const centreStats = Object.entries(centreMap).map(([centre, info]) => ({
      centre,
      total: info.total,
      open: info.open,
      treated: info.treated,
      cancelled: info.cancelled,
      approved: info.approved,
      rejected: info.rejected,
      closed: info.closed,
    }));

    // --- Priorités ---
    const priorityStats = { Normal: 0, Important: 0, Urgent: 0 } as Record<string, number>;
    requests.forEach((r) => {
      const p = r.priority || 'Normal';
      priorityStats[p] = (priorityStats[p] ?? 0) + 1;
    });

    // --- Types de demande (top 6) ---
    const typeMap: Record<string, number> = {};
    requests.forEach((r) => {
      const type = r.requesttype?.displayName ?? 'Other';
      typeMap[type] = (typeMap[type] ?? 0) + 1;
    });
    const typeStats = Object.entries(typeMap)
      .map(([type, total]) => ({ type, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);

    // --- Erreurs par agent labo (top 6) ---
    const agentMap: Record<string, { agent: string; matricule: string; total: number; open: number }> = {};
    requests.forEach((r) => {
      if (!r.labAgent) return;
      const key = r.labAgent.id;
      if (!agentMap[key])
        agentMap[key] = {
          agent: [r.labAgent.lastName, r.labAgent.firstName].filter(Boolean).join(' '),
          matricule: r.labAgent.matricule,
          total: 0,
          open: 0,
        };
      agentMap[key].total++;
      if (r.status === RequesterStatusEnum.Open || r.status === RequesterStatusEnum.Approved)
        agentMap[key].open++;
    });
    const labAgentStats = Object.values(agentMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);

    // --- Évolution : par jour (<= 92 jours) sinon par mois ---
    const pad = (n: number) => String(n).padStart(2, '0');
    const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const monthKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    const spanDays = Math.ceil((end.getTime() - start.getTime()) / 86400000);
    const granularity: 'day' | 'month' = spanDays <= 92 ? 'day' : 'month';
    const buckets: Record<string, number> = {};
    const cursor = new Date(start.getFullYear(), start.getMonth(), granularity === 'day' ? start.getDate() : 1);
    while (cursor <= end) {
      buckets[granularity === 'day' ? dayKey(cursor) : monthKey(cursor)] = 0;
      if (granularity === 'day') cursor.setDate(cursor.getDate() + 1);
      else cursor.setMonth(cursor.getMonth() + 1);
    }
    requests.forEach((r) => {
      const d = new Date(r.createdAt);
      const k = granularity === 'day' ? dayKey(d) : monthKey(d);
      if (k in buckets) buckets[k]++;
    });
    const trend = Object.entries(buckets).map(([date, total]) => ({ date, total }));

    return {
      globalStats,
      emitterStats,
      centreStats,
      priorityStats,
      typeStats,
      labAgentStats,
      trend,
      granularity,
      period: { start, end },
    };
  }
}

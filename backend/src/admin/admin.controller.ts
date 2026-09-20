import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { ReportStatus } from '@prisma/client';

const REPORT_STATUSES: ReportStatus[] = ['OFFEN', 'GESCHLOSSEN'];
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/jwt.strategy';
import { ChatService } from '../chat/chat.service';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
import { CreateReportDto } from './dto/create-report.dto';
import { DeleteListingDto } from './dto/delete-listing.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';

@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly chatService: ChatService,
  ) {}

  // No AdminGuard here on purpose: any authenticated STUDENT can file a
  // report. Admins act directly instead (they have no reason to report
  // anything through this endpoint).
  @UseGuards(ThrottlerGuard)
  @Post('reports')
  createReport(@CurrentUser() user: JwtPayload, @Body() dto: CreateReportDto) {
    if (user.role !== 'STUDENT') {
      throw new ForbiddenException(
        'Nur Studierende können Meldungen einreichen.',
      );
    }
    return this.adminService.createReport(user.sub, dto);
  }

  @UseGuards(AdminGuard)
  @Get('reports')
  listReports(@Query('status') status?: string) {
    // An unrecognized value previously reached Prisma as an invalid enum
    // filter, which throws there instead of failing validation here —
    // surfaced as an unhandled 500.
    if (status && !REPORT_STATUSES.includes(status as ReportStatus)) {
      throw new BadRequestException('Ungültiger Status.');
    }
    return this.adminService.listReports(status as ReportStatus | undefined);
  }

  // Read-only, no participant check — an admin reviewing a report that
  // links a conversation isn't one of its two participants by definition.
  @UseGuards(AdminGuard)
  @Get('conversations/:id/messages')
  getConversationMessages(@Param('id') id: string) {
    return this.chatService.getMessagesForAdmin(id);
  }

  @UseGuards(AdminGuard)
  @Patch('reports/:id/resolve')
  resolveReport(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ResolveReportDto,
  ) {
    return this.adminService.resolveReport(id, user.sub, dto);
  }

  @UseGuards(AdminGuard)
  @Get('users')
  listUsers() {
    return this.adminService.listUsers();
  }

  @UseGuards(AdminGuard)
  @Delete('users/:id')
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: DeleteUserDto,
  ) {
    await this.adminService.deleteUser(id, user.sub, dto.note);
    return { deleted: true };
  }

  @UseGuards(AdminGuard)
  @Delete('listings/:id')
  async deleteListing(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: DeleteListingDto,
  ) {
    await this.adminService.deleteListing(id, user.sub, dto.note);
    return { deleted: true };
  }

  @UseGuards(AdminGuard)
  @Get('audit-log')
  listAuditLog() {
    return this.adminService.listAuditLog();
  }
}

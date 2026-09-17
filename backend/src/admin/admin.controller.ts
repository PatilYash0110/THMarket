import {
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
import type { ReportStatus } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/jwt.strategy';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
import { CreateReportDto } from './dto/create-report.dto';
import { DeleteListingDto } from './dto/delete-listing.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';

@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // No AdminGuard here on purpose: any authenticated STUDENT can file a
  // report. Admins act directly instead (they have no reason to report
  // anything through this endpoint).
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
  listReports(@Query('status') status?: ReportStatus) {
    return this.adminService.listReports(status);
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
